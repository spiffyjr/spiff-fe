'use strict';

var app = angular.module('app');
app.controller('IndicatorCtrl', function($scope, Client, Parser) {
    var loadImage = function(uri, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            callback(window.URL.createObjectURL(xhr.response), uri);
        };
        xhr.open('GET', uri, true);
        xhr.send();
    };

    Parser.onIndicator = function(type, value) {
        var selector = 'position-img';
        if (type == 'hidden' || type == 'invisible') {
            selector = 'visibility-img';
        }

        if (value) {
            loadImage('/asset/img/' + type + '.png', function (blobUri) {
                document.getElementById(selector).src = blobUri;
            })
        } else if (selector == 'visibility-img') {
            loadImage('/asset/img/1x1-pixel.png', function (blobUri) {
                document.getElementById(selector).src = blobUri;
            });
        }
    };
});