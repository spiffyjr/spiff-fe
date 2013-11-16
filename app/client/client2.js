'use strict';

angular.module('client', ['client.buffer', 'client.socket'])
    .factory('Client', function(Socket, Buffer) {
        var Client = function Client(socket, parser) {
            var callbacks = {};

            var buffer = {};

            var stream, style;

            var textHighlights = [];

            var tags = {};

            var applyHighlight = function(str, replace, css) {
                return str.replace(replace, '<span class="' + css + '">' + replace + '</span>');
            };

            var parseHighlights = function(str) {
                for (var i = 0; i < textHighlights.length; i++) {
                    var matches, hl = textHighlights[i];

                    if (matches = str.match(hl.regex)) {
                        str = applyHighlight(str, matches[0], hl.css);
                    }
                }
                return str;
            };

            var nl2br = function(str) {
                return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
            };

            var handleGameString = function(str) {
                //if (str.match(/>$/) && !str.match(/<\/a>$|[^>]<style id=""\/>$/)) {
                    //str = str + "\n";
                //}

                parser.parse('<xml>' + str + '</xml>');
            };

            this.addHighlight = function(regex, css) {
                textHighlights.push({
                    regex: regex,
                    css: css
                });
            };

            this.on = function(event, callback) {
                //if (!callbacks[event]) {
                    //callbacks[event] = [];
                //}
                //callbacks[event].push(callback);
                callbacks[event] = callback;
            };

            this.send = function(str) {
                socket.write(str);
            };

            parser.on('error', function(msg) {
                console.log('parsing error: ' + msg);
                console.log('-----------------------');
                tags = {};
            });

            parser.on('startNode', function(name, attr) {
                if (name == 'pushStream') {
                    stream = attr().id;
                } else if (name == 'popStream') {
                    stream = null;
                } else if (name == 'style') {
                    style = attr().id;
                } else if (name == 'progressBar') {
                    if (callbacks.status) {
                        callbacks.status(attr());
                    }
                } else if (name == 'a') {
                    tags.a = true;
                } else if (name == 'compDef') {
                    tags.ignore = true;
                }
            });

            parser.on('endNode', function(name) {
                if (name == 'compDef') {
                    delete tags.ignore;
                } else if (name == 'a') {
                    delete tags.a;
                }
            });

            parser.on('textNode', function(str) {
                if (!callbacks.text) {
                    return;
                }

                str.replace(/[\r\n]+/, '');

                //str = parseHighlights(str);

                if (tags.a) {
                    //str = applyHighlight(str, str, 'highlight');
                } else if (tags.ignore) {
                    return;
                }

                if (style) {
                    //str = applyHighlight(str, str, style);
                }

                str = nl2br(str);
                //console.log(str);
                callbacks.text(str, stream);
            });

            /*
            parser.onend = function() {
                for (var stream in buffer) {
                    if (buffer.hasOwnProperty(stream)) {
                        for (var i = 0; i < callbacks.text.length; i++) {
                            callbacks.text[i](buffer[stream], stream);
                        }
                    }
                }
                buffer = {};
            };*/

            socket.ondata(handleGameString);
            socket.connect();
        };

        var client = new Client(Socket, new EasySAXParser());
        //var client = new Client(Socket, sax.parser(false));

        client.addHighlight(/\([0-9][0-9]:[0-9][0-9]:[0-9][0-9]\)$/, 'numbers');
        client.addHighlight(/^\[LNet\]/, 'lnet');
        client.addHighlight(/Obvious (?:exits|paths):/, 'paths');
        client.addHighlight(/^\[Private(?:To)?\]/, 'private');

        return client;
    });