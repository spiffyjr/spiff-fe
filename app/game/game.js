'use strict';

angular.module('game', ['client', 'client.parser'])
    .config(function ($routeProvider) {
        $routeProvider.when('/game', { controller: 'GameCtrl', templateUrl: 'game/game.html' });
    })
    .controller('GameCtrl', function($scope, Client, Parser) {
        $scope.thoughts = [];
        $scope.logons   = [];
        $scope.game     = [];

        $scope.hands = {
            left: 'Empty',
            right: 'Empty'
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
            if (undefined === $scope[stream]) {
                return;
            }

            // Remove end of lines because they're handled by div's.
            //text = text.replace(/^[\r\n]/gm, '').replace(/[\r\n]$/gm, '');

            $scope[stream].push(text);
            $scope[stream] = $scope[stream].splice(-100);
            $scope.$$phase || $scope.$apply();
        };
    });