'use strict';

angular.module('indicator', ['client', 'client.parser'])
    .controller('IndicatorCtrl', function($scope, Client, Parser) {
        var loadImage = function(uri, callback) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
                callback(window.webkitURL.createObjectURL(xhr.response), uri);
            };
            xhr.open('GET', uri, true);
            xhr.send();
        };

        Parser.onIndicator = function(type, value) {
            if (!value) {
                return;
            }

            if (type == 'hidden') {
                type = 'stealthed';
            }

            var selector = 'position-img';
            if (type == 'stealthed' || type == 'invisible') {
                selector = 'visibility-img';
            }

            loadImage('/asset/img/' + type + '.png', function(blobUri) {
                document.getElementById(selector).src = blobUri;
            })
        };
    });