'use strict';

angular.module('client.parser', [])
    .factory('Parser', function() {
        var Parser = function Parser() {
            var xmlRegex = new RegExp(/(<(prompt|spell|right|left|inv|compass).*?\2>|<.*?>)/);

            var serverTimeToMs = function(timestamp) {
                return ((timestamp * 1000) - (+new Date())) /*+ serverTimeOffset*/;
            };

            var handleProgressBar = function(matches) {
                var id    = matches[1];
                var value = matches[2];
                var text  = matches[3];
                var max   = 0;

                if (id == 'pbarStance') {
                    max = 100
                } else if (id == 'mindState') {
                    if (text == 'saturated') {
                        value = 110;
                    }
                    max = 110;
                } else if (id == 'encumlevel') {
                    if (text == 'Overloaded') {
                        value = 110;
                    }
                    max = 110;
                } else if (matches = text.match(/(\-?[0-9]+)\/([0-9]+)/)) {
                    value = matches[1];
                    max   = matches[2];
                } else {
                    //console.log('progressBar: unsupported id "' + id + '"');
                    return;
                }

                this.onProgressBar(id, value, max);
            }.bind(this);

            this.parse = function(str) {
                var matches;

                //console.log(str);
                while (str.length > 0) {
                    matches = xmlRegex.exec(str);

                    if (matches && matches.index == 0) {
                        var xml = matches[1];
                        str = str.slice(xml.length);

                        if (matches = xml.match(/^<progressBar id='(.*?)' value='([0-9]+)'(?: text='(.*)')?/)) {
                            handleProgressBar(matches);
                        } else if (matches = xml.match(/^<(?:style|preset) id=('|")(.*?)\1/)) {
                            if (matches[2]) {
                                this.onStyleStart(matches[2]);
                            } else {
                                this.onStyleEnd();
                            }
                        } else if (xml == '<pushBold/>' || xml == '<b>') {
                            this.onStyleStart('bold');
                        } else if (matches = xml.match(/^<prompt time=('|")([0-9]+)\1.*?>(.*?)&gt;<\/prompt>$/)) {
                            this.onPrompt(matches[2], matches[3]);
                        } else if (xml == '<popBold/>' || xml == '</b>') {
                            this.onStyleEnd();
                        } else if (xml.match(/<a/)) {
                            //this.onStyleStart('link');
                        } else if (xml == '</a>') {
                            //this.onStyleEnd();
                        } else if (matches = xml.match(/^<(?:pushStream|component|compDef) id=("|')(.*?)\1[^>]*\/?>$/)) {
                            this.onStreamStart(matches[2]);
                        } else if (xml.match(/^<popStream/) || xml == '</component>' || xml == '</compDef>') {
                            this.onStreamEnd();
                        } else if (matches = xml.match(/^<roundTime value=('|")([0-9]+)\1/)) {
                            this.onRoundTime('hard', serverTimeToMs(matches[2]));
                        } else if (matches = xml.match(/^<castTime value=('|")([0-9]+)\1/)) {
                            this.onRoundTime('soft', serverTimeToMs(matches[2]));
                        } else if (matches = xml.match(/^<LaunchURL src="(.*)" \/>/)) {
                            this.onLaunchUrl(matches[1]);
                        } else if (matches = xml.match(/^<preset id=('|")(.*?)\1>$/)) {
                            this.onStyleStart(matches[2]);
                        } else if (xml == '</preset>') {
                            this.onStyleEnd();
                        } else if (xml.match(/^<(?:dialogdata|d|\/d|\/?component|label|skin|output)/)) {
                        } else {
                            //console.log('unhandled xmlTag: ' + xml);
                        }
                    } else {
                        var text = matches ? str.slice(0, matches.index) : str;
                        str = str.slice(text.length);

                        if (text.length > 0) {
                            this.onText(text);
                        }
                    }
                }

                this.onParseComplete();
            };

            this.onParseComplete = function() {
                console.log('onParseComplete');
            };

            this.onLaunchUrl = function(url) {
                console.log('onLaunchUrl: ' + url);
            };

            this.onRoundTime = function(type, value) {
                console.log('onRoundTime: ' + type + ', value: ' + value);
            };

            this.onStyleStart = function(style) {
                console.log('onStyleStart: ' + style);
            };

            this.onStyleEnd = function() {
                console.log('onStyleEnd');
            };

            this.onStreamStart = function(stream) {
                console.log('onStreamStart: ' + stream);
            };

            this.onStreamEnd = function() {
                console.log('onStreamEnd');
            };

            this.onPrompt = function(timestamp, status) {
                console.log('onPrompt: ' + timestamp, ', status: ' + status);
            };

            this.onText = function(text) {
                if (text.length > 0) {
                    console.log(text);
                }
            };

            this.onProgressBar = function(type, current, max) {
                console.log('onProgressBar: ' + type + ', ' + current + ', ' + max);
            };
        };

        return new Parser();
    });