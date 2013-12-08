'use strict';

angular.module('game', ['client', 'client.parser'])
    .config(function ($routeProvider) {
        $routeProvider.when('/game', { controller: 'GameCtrl', templateUrl: 'game/game.html' });
    })
    .controller('GameCtrl', function($scope, Client, Parser) {
        $scope.thoughts  = [];
        $scope.logons    = [];
        $scope.game      = [];
        $scope.room_objs = '';

        $scope.hands = {
            left: 'Empty',
            right: 'Empty',
            casting: 'None'
        };

        Parser.onHandUpdated = function(hand, item) {
            $scope.hands[hand] = item;
        };

        Parser.onLaunchUrl = function(url) {
            window.open('http://www.play.net/' + url);
        };

        Client.onText = function(text, stream) {
            if (!stream) {
                stream = 'game';
            }
            stream = stream.replace(/\s+/, '_');
            if (stream == 'death') {
                stream = 'logons'
            }
            if (undefined === $scope[stream]) {
                return;
            }

            var ele = angular.element('<div>');
            ele.addClass('game-content');
            ele.html(text);

            if (stream == 'room_objs') {
                document.getElementById(stream).innerHTML = ele[0].innerHTML;
            } else {
                document.getElementById(stream).appendChild(ele[0]);
            }

            $scope.$$phase || $scope.$apply();
        };
    });