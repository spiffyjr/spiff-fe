'use strict';

angular.module('client.parser', [])
    .factory('Parser', function() {
        var Parser = function Parser() {
            var serverTimeOffset = 0;

            var xmlRegex = new RegExp(/(<(prompt|spell|right|left|inv|compass).*?\2>|<.*?>)/);

            var serverTimeToMs = function(timestamp) {
                return ((Number(timestamp) + serverTimeOffset) - (+new Date() / 1000)) * 1000;
            };

            var handleProgressBar = function(matches) {
                var id    = matches[1];
                var value = matches[2];
                var text  = matches[3];
                var max   = 100;

                if (id == 'pbarStance') {
                    //max = 100
                } else if (id == 'mindState') {
                    if (text == 'saturated') {
                        value = 110;
                    }
                    //max = 110;
                } else if (id == 'encumlevel') {
                    if (text == 'Overloaded') {
                        value = 110;
                    }
                    //max = 110;
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
                var stream = false;
                var bold   = false;

                while (str.length > 0) {
                    matches = xmlRegex.exec(str);
                    if (matches && matches.index == 0) {
                        var xml = matches[1];

                        str = str.slice(xml.length);

                        if (matches = xml.match(/^<progressBar id='(.*?)' value='(.*)'(?: text='(?:\1 )?(.*))?'/)) {
                            handleProgressBar(matches);
                        } else if (matches = xml.match(/^<(?:style|preset) id=('|")(.*?)\1/)) {
                            if (matches[2]) {
                                this.onStyleStart(matches[2]);
                            } else {
                                this.onStyleEnd();
                            }
                        } else if (xml == '<pushBold/>' || xml == '<b>') {
                            this.onStyleStart('bold');
                            bold = true;
                        } else if (xml == '<popBold/>' || xml == '</b>') {
                            this.onStyleEnd();
                            bold = false;
                        } else if (matches = xml.match(/^<prompt time=('|")([0-9]+)\1.*?>(.*?)&gt;<\/prompt>$/)) {
                            serverTimeOffset = Number((+new Date() / 1000) - matches[2]);
                            this.onPrompt(matches[2], matches[3]);
                        /*} else if (/<a/.test(xml) && !/coord="\d+,\d+"/.test(xml) && !bold) {
                            this.onStyleStart('link');
                        } else if (xml == '</a>' && !bold) {
                            this.onStyleEnd();*/
                        } else if (matches = xml.match(/^<(?:pushStream|component) id=("|')(.*?)\1[^>]*\/?>$/)) {
                            this.onStreamStart(matches[2]);
                            stream = true;
                        } else if (/^<popStream/.test(xml) || xml == '</component>') {
                            this.onStreamEnd();
                            stream = false;
                        } else if (matches = xml.match(/^<roundTime value=('|")([0-9]+)\1/)) {
                            this.onRoundTime('hard', serverTimeToMs(matches[2]));
                        } else if (matches = xml.match(/^<castTime value=('|")([0-9]+)\1/)) {
                            this.onRoundTime('soft', serverTimeToMs(matches[2]));
                        } else if (matches = xml.match(/^<LaunchURL src="(.*)" \/>/)) {
                            this.onLaunchUrl(matches[1]);
                        } else if (matches = xml.match(/^<output class=('|")(\w+)\1\/>/)) {
                            this.onStyleStart(matches[2]);
                        } else if (/<output class=('|")\1\/>/.test(xml)) {
                            this.onStyleEnd();
                        } else if (matches = xml.match(/^<preset id=('|")(.*?)\1>$/)) {
                            this.onStyleStart(matches[2]);
                        } else if (xml == '</preset>') {
                            this.onStyleEnd();
                        } else if (matches = xml.match(/^<(right|left).*>([\w\s'-]+)<\/\1>/)) {
                            this.onHandUpdated(matches[1], matches[2]);
                        } else if (matches = xml.match(/^<indicator id=('|")Icon([A-Z]+)\1 visible=('|")([yn])\3/)) {
                            this.onIndicator(matches[2].toLowerCase(), matches[4] == 'y');
                        } else if (/^<(?:dialogdata|d|\/d|\/?component|image|label|skin|a|\/a|resource|streamWindow|progressBar|compDef|sep)/.test(xml)) {
                        } else {
                            //console.log('unhandled xmlTag: ' + xml);
                        }

                        if (!stream && str.replace(/[\r\n]+/gm, '').length == 0) {
                            break;
                        }
                    } else {
                        var text = matches ? str.slice(0, matches.index) : str;
                        str = str.slice(text.length);

                        this.onText(text);
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

            this.onHandUpdated = function(hand, item) {
                console.log('onHandUpdated: ' + hand + ', item: ' + item);
            };

            this.onPrompt = function(timestamp, status) {
                console.log('onPrompt: ' + timestamp, ', status: ' + status);
            };

            this.onIndicator = function(type, value) {
                console.log('onIndicator: ' + type + ', value: ' + value);
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