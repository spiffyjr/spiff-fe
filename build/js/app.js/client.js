'use strict';

var app = angular.module('app');
app.factory('Client', function(Parser, Socket, SettingsService) {
    var Client = function Client(SettingsService, Parser, socket) {
        this.settings = {};

        SettingsService.load(function() {
            this.settings = SettingsService.settings;
        }.bind(this));

        var activeStream = null;

        var activeStyle = null;

        var promptText = '&gt;';

        var needPrompt = false;

        var monoEnabled = false;

        var activeText = '';

        var onGameData = function(str)
        {
            Parser.parse(str);
        };

        var applyHighlight = function(str, hl)
        {
            if (str.trim().length == 0) {
                return str;
            }

            var tmp  = angular.element('<span>').html(str);
            var find = hl.regex ? new RegExp(hl.regex, "g") : hl.string;

            findAndReplaceDOMText(tmp[0], {
                find: find,
                replace: function(portion) {
                    var span = angular
                        .element('<span>')
                        .css(hl.style)
                        .html(portion.text);

                    return span[0];
                }
            });

            return tmp.html();
        }.bind(this);

        var applyHighlights = function(str)
        {
            angular.forEach(this.settings.highlights, function(hl) {
                str = applyHighlight(str, hl);
            });
            return str;
        }.bind(this);

        var sendPrompt = function(text, cmd)
        {
            if (activeStream) {
                return;
            }
            if (cmd) {
                text = text + cmd;
            }

            if (this.settings.presets.prompt) {
                text = applyHighlight(text, {
                    string: text.replace('&gt;', '>'),
                    style: this.settings.presets.prompt
                });
            }

            this.onText(text + "\n", null);
        }.bind(this);

        this.getSocket = function()
        {
            return socket;
        };

        this.sendText = function()
        {
            if (activeText == '') {
                if (!activeStream) {
                    if (needPrompt) {
                        needPrompt = false;
                        sendPrompt(promptText);
                    }
                }
                return;
            }

            if (/^\[.*?\]>/.test(activeText)) {
                needPrompt = false;
            }

            if (activeStream) {
                var matches;
                if (matches = activeText.match(/(\w+) joins the adventure/)) {
                    activeText = applyHighlight(matches[1], {
                        string: matches[1],
                        style: this.settings.presets.logons
                    });
                } else if (matches = activeText.match(/(\w+) returns home from a hard day of adventuring/)) {
                    activeText = applyHighlight(matches[1], {
                        string: matches[1],
                        style: this.settings.presets.logoffs
                    });
                } else if (matches = activeText.match(/(\w+) has disconnected/)) {
                    activeText = applyHighlight(matches[1], {
                        string: matches[1],
                        style: this.settings.presets.disconnects
                    });
                } else if (matches = activeText.match(/(\w+) (?:just bit the dust|has been vaporized|was just incinerated|echoes in your mind)/)) {
                    activeText = applyHighlight(matches[1], {
                        string: matches[1],
                        style: this.settings.presets.deaths
                    });
                }
            }

            // Detect stance changes
            if (matches = activeText.match(/^You are currently at an? (\w+) stance\./)) {
                var values = {
                    offensive: 0,
                    advance:   20,
                    forward:   40,
                    neutral:   60,
                    guarded:   80,
                    defensive: 100
                };
                Parser.onProgressBar('pbarStance', values[matches[1]], 100);
            }

            if (matches = activeText.match(/https?:\/\/.*\s/)) {
                activeText = activeText.replace(matches[0], '<a href="' + matches[0] + '" target="_blank">' + matches[0] + '</a>');
            }

            activeText = applyHighlights(activeText);

            if (needPrompt) {
                needPrompt = false;
                sendPrompt(promptText);
            }

            if (!monoEnabled) {
                this.onText(activeText, activeStream);
                activeText = '';
            }
        };

        this.connect = function(hostname, port, callback)
        {
            socket.connect(hostname, port, callback);
        };

        this.disconnect = function()
        {
            socket.disconnect();
        };

        this.send = function(str)
        {
            if (str.trim().length == 0) {
                return;
            }
            needPrompt = false;
            sendPrompt(promptText, str);
            socket.write(str);
        };

        this.onText = function(text, stream)
        {
            console.log('stream: ' + stream);
            console.log('text: ' + text);
        };

        Parser.onPrompt = function(timestamp, status)
        {
            var newPromptText = status + "&gt;";

            if (promptText != newPromptText) {
                needPrompt = false;
                promptText = newPromptText;
            } else {
                needPrompt = true
            }
        };

        Parser.onStyleStart = function(style)
        {
            if (style == 'mono') {
                monoEnabled = true;
                return;
            }

            if (activeStream == 'logons') {
                return;
            }
            activeStyle = style;
        };

        // todo: This interval + parseComplete is a pretty hacky solution but it works for now.
        // I should figure out a better way to delay updates and increase performance.
        Parser.onParseComplete = function()
        {
            activeText = activeText + '<div></div>';
        }.bind(this);

        setInterval(function()
        {
            this.sendText();
        }.bind(this), 10);


        Parser.onStyleEnd = function()
        {
            if (monoEnabled && this.settings.presets.mono) {
                activeText = angular
                    .element('<span>')
                    .html(activeText)
                    .css(this.settings.presets.mono)[0].outerHTML;
            }

            monoEnabled = false;
            activeStyle = null;
        }.bind(this);

        Parser.onStreamStart = function(stream)
        {
            activeStream = stream;
            needPrompt   = false;
        }.bind(this);

        Parser.onStreamEnd = function()
        {
            this.sendText();
            activeStream = null;
        }.bind(this);

        Parser.onText = function(text)
        {
            // Replace any bad characters
            text = text.replace('<', '&lt;').replace('>', '&gt;');

            // Styles have to be applied during onText so they happen in the correct order.
            // Individual highlights are handled in sendText so they cover the entire string going out.
            if (activeStyle && this.settings.presets[activeStyle] && text.trim().length > 0) {
                text = applyHighlight(text, {
                    string: text.trim(),
                    style: this.settings.presets[activeStyle]
                });
            }

            activeText = activeText + text;
        }.bind(this);

        socket.ondata(onGameData);
    };

    return new Client(SettingsService, Parser, Socket);
});