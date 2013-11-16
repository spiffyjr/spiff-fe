'use strict';

angular.module('client', ['client.socket'])
    .factory('Client', function(Socket) {
        var Client = function Client(socket) {
            var callbacks = {
                hardrt: null,
                softrt: null,
                status: null,
                stream: null,
                text: null
            };

            var stream, needPrompt = false, style = {};

            var styleMatches = [];

            var textHighlights = [];

            var buffers = {
                game: [],
                logons: [],
                thoughts: []
            };

            var escapeEntities = function(str) {
                return str
                    .replace('<', '&lt;')
                    .replace('>', '&gt;');
            };

            var applyHighlight = function(str, hl) {
                var tmp = angular.element('<span>').html(str);

                findAndReplaceDOMText(tmp[0], {
                    find: hl.regex,
                    replace: function(portion) {
                        var span = angular
                            .element('<span>')
                            .attr('class', hl.css)
                            .html(portion.text);

                        return span[0];
                    }
                });

                return tmp.html();
            };

            var parseHighlights = function(str) {
                for (var i = 0; i < textHighlights.length; i++) {
                    str = applyHighlight(str, textHighlights[i]);
                }
                return str;
            };

            var addPrompt = function(cmd) {
                if (!cmd) {
                    cmd = '';
                }
                buffers.game.push('<span class="prompt">&gt;' + cmd + '</span>');
                if (cmd) {
                    buffers.game.push("\n");
                }
                callbacks.buffer(buffers.game, stream);
            };

            var handleGameText = function(text) {
                text = escapeEntities(text);

                if (style) {
                    style.end = text.length;
                    styleMatches.push({
                        regex: text.substr(style.start, style.end - style.start),
                        css: style.css
                    });
                    style = null;
                }

                if (text.match(/^\[.*?\]>/)) {
                    needPrompt = false;
                }

                if (text.trim().length > 0) {
                    text = parseHighlights(text);

                    // parse styles
                    var styleMatch;
                    while (styleMatch = styleMatches.pop()) {
                        if (styleMatch.regex && styleMatch.css) {
                            text = applyHighlight(text, styleMatch);
                        }
                    }

                    if (stream) {
                        var matches;
                        if (stream == 'thoughts') {
                            if (text.match(/^\[.+?\]\-[A-z]+\:[A-Z][a-z]+\: "|^\[server\]\: /)) {
                                //stream = 'lnet'
                            }
                        }
                        if (buffers[stream]) {
                            if (stream == 'death' || stream == 'logons') {
                                if (matches = text.match(/(\w+) (?:just bit the dust|has been vaporized|was just incinerated)/)) {
                                    text = '<span class="logons death">' + matches[1] + " died</span>\n";
                                } else if (matches = text.match(/(\w+) (joins the adventure|returns home from a hard day of adventuring|has disconnected)/)) {
                                    var css;
                                    if (matches[2] == 'joins the adventure') {
                                        css = 'join';
                                    } else {
                                        css = 'leave';
                                    }

                                    text = '<span class="logons ' + css + '">' + matches[1] + "</span>\n";
                                }
                            }
                            if (!text.match(/^\[server\]: "(?:kill|connect)/)) {
                                buffers[stream].push(text);
                                callbacks.buffer(buffers[stream], stream);
                            }
                        }
                    } else {
                        if (needPrompt) {
                            needPrompt = false;
                            addPrompt();
                        }

                        buffers.game.push(text);
                        callbacks.buffer(buffers.game, stream);
                    }
                }
            };

            var parseGameLine = function(line) {
                var matches, xml, start;

                line = line.replace(/(?:\r\n|\r|\n)+$/, "\n");
                while (matches = line.match(/(<(prompt|spell|right|left|inv|compass).*?\2>|<.*?>)/)) {
                    xml   = matches[1];
                    start = matches.index;
                    line  = line.substr(0, start) + line.substr(start + xml.length);

                    if (matches = xml.match(/^<prompt time=('|")([0-9]+)\1.*?>(.*?)&gt;<\/prompt>$/)) {
                        needPrompt = true;
                    } else if (matches = xml.match(/^<progressBar id='(.*?)' value='[0-9]+' text='\1 (\-?[0-9]+)\/([0-9]+)'/)) {
                        if (callbacks.status) {
                            callbacks.status(matches[1], matches[2], matches[3])
                        }
                    } else if (matches = xml.match(/^<progressBar id='encumlevel' value='([0-9]+)' text='(.*?)'/)) {
                        if (callbacks.status) {
                            if (matches[2] == 'Overloaded') {
                                matches[1] = 110;
                            }
                            callbacks.status('encumlevel', matches[1], 110);
                        }
                    } else if (matches = xml.match(/^<progressBar id='pbarStance' value='([0-9]+)'/)) {
                        if (callbacks.status) {
                            callbacks.status('pbarStance', matches[1], 100);
                        }
                    } else if (matches = xml.match(/^<progressBar id='mindState' value='(.*?)' text='(.*?)'/)) {
                        if (callbacks.status) {
                            if (matches[2] == 'saturated') {
                                matches[1] = 110;
                            }
                            callbacks.status('mindState', matches[1], 110);
                        }
                    } else if (matches = xml.match(/^<roundTime value=('|")([0-9]+)\1/)) {
                        if (callbacks.hardrt) {
                            callbacks.hardrt(matches[2] - Math.round(+new Date() / 1000));
                        }
                    } else if (matches = xml.match(/^<castTime value=('|")([0-9]+)\1/)) {
                        if (callbacks.softrt) {
                            callbacks.softrt(matches[2] - Math.round(+new Date() / 1000));
                        }
                    } else if (matches = xml.match(/^<style id=("|')(.*?)\1/)) {
                        if (matches[2]) {
                            style = {
                                start: start,
                                css: matches[2]
                            };
                        } else {
                            if (style) {
                                style.end = start;
                                styleMatches.push({
                                    regex: line.substr(style.start, style.end - style.start),
                                    css: style.css
                                });
                                style = null;
                            }
                        }
                    } else if (matches = xml.match(/^<a exist="(-?\d+)" noun="\w+"(?: coords="\d+,\d+")?>/)) {
                        var css = 'highlight';
                        if (matches[1] && matches[1][0] == '-') {
                            css = 'person';
                        }
                        style = {
                            start: start,
                            css: css
                        };
                    } else if (xml.match(/^<\/a>/)) {
                        if (style) {
                            style.end = start;
                            styleMatches.push({
                                regex: line.substr(style.start, style.end - style.start),
                                css: style.css
                            });
                            style = null;
                        }
                    } else if (matches = xml.match(/^<(?:pushStream|component) id=("|')(.*?)\1[^>]*\/?>$/)) {
                        stream = matches[2];
                        handleGameText(line.slice(0, start));
                        line   = line.substr(start);
                    } else if (xml.match(/^<popStream/) || xml == '</component>') {
                        handleGameText(line.slice(0, start));
                        line   = line.substr(start);
                        stream = null;
                    } else if (xml.match(/^<compDef/)) {
                        ;
                    } else if (xml.match(/^<streamWindow/)) {
                        return;
                    }
                }
                handleGameText(line);
            };

            this.addHighlight = function(regex, css) {
                textHighlights.push({
                    regex: regex,
                    css: css
                });
            };

            this.on = function(event, callback) {
                callbacks[event] = callback;
            };

            this.send = function(str) {
                if (str.length == 0) {
                    return;
                }
                needPrompt = false;
                addPrompt(str);
                socket.write(str);
            };

            socket.ondata(parseGameLine);
            socket.connect();
        };

        var client = new Client(Socket);

        client.addHighlight(/\([0-9][0-9]:[0-9][0-9]:[0-9][0-9]\)$/, 'numbers');
        client.addHighlight(/^\[LNet\]/, 'lnet');
        client.addHighlight(/Obvious (?:exits|paths):/, 'paths');
        client.addHighlight(/^\[Private(?:To)?\]/, 'private');

        return client;
    });