'use strict';

angular.module('client', ['client.parser', 'client.socket', 'settings'])
    .factory('Client', function(Parser, Socket, SettingsService) {
        var Client = function Client(Parser, socket) {
            this.settings = {
                css: null,
                highlights: null,
                presets: null,
                macros: null
            };

            var activeStream = null;

            var activeStyle = null;

            var promptText = '&gt;';

            var needPrompt = false;

            var activeText = '';

            var onGameData = function(str) {
                Parser.parse(str);
            };

            var applyHighlight = function(str, hl) {
                var css = this.settings.css[hl.css];
                if (!css) {
                    return str;
                }

                var tmp  = angular.element('<span>').html(str);
                var find = hl.regex ? new RegExp(hl.regex) : hl.string;

                findAndReplaceDOMText(tmp[0], {
                    find: find,
                    replace: function(portion) {
                        var span = angular
                            .element('<span>')
                            .css(css)
                            .html(portion.text);

                        return span[0];
                    }
                });

                return tmp.html();
            }.bind(this);

            var applyHighlights = function(str) {
                angular.forEach(this.settings.highlights, function(hl) {
                    str = applyHighlight(str, hl);
                });
                return str;
            }.bind(this);

            var sendPrompt = function(text, cmd) {
                if (activeStream) {
                    return;
                }
                if (cmd) {
                    text = text + cmd;
                }

                if (this.settings.presets.prompt) {
                    text = applyHighlight(text, {
                        regex: '.*',
                        css: this.settings.presets.prompt
                    });
                }

                this.onText(text + "\n", null);
            }.bind(this);

            var addText = function(text) {
                activeText = activeText + text;
            };

            var handleText = function(text) {
                if (text.match(/^\[.*?\]>/)) {
                    needPrompt = false;
                }

                text = applyHighlights(text);

                if (activeStyle && this.settings.presets[activeStyle]) {
                    text = applyHighlight(text, {
                        string: text,
                        css: this.settings.presets[activeStyle]
                    });
                }

                addText(text);
                if (needPrompt) {
                    needPrompt = false;
                    sendPrompt(promptText);
                }
            }.bind(this);

            this.connect = function(hostname, port, callback) {
                socket.connect(hostname, port, callback);
            };

            this.disconnect = function() {
                socket.disconnect();
            };

            this.send = function(str) {
                if (str.trim().length == 0) {
                    return;
                }
                needPrompt = false;
                sendPrompt(promptText, str);
                socket.write(str);
            };

            this.onText = function(text, stream) {
                console.log('stream: ' + stream);
                console.log('text: ' + text);
            };

            Parser.onPrompt = function(timestamp, status) {
                var newPromptText = status + "&gt;";

                if (promptText != newPromptText) {
                    needPrompt = false;
                    promptText = newPromptText;
                    sendPrompt(promptText);
                } else {
                    needPrompt = true;
                }
            };

            Parser.onParseComplete = function() {
                this.onText(activeText, activeStream);
                activeText   = '';
            }.bind(this);

            Parser.onStyleStart = function(style) {
                activeStyle = style;
            };

            Parser.onStyleEnd = function() {
                activeStyle = null;
            };

            Parser.onStreamStart = function(stream) {
                activeStream = stream;
            }.bind(this);

            Parser.onStreamEnd = function() {
                this.onText(activeText, activeStream);
                activeText = '';
                activeStream = null;
            }.bind(this);

            Parser.onText = handleText;

            socket.ondata(onGameData);
        };

        var client = new Client(Parser, Socket);

        SettingsService.load(function(settings) {
            client.settings = settings;
        });

        return client;
    });