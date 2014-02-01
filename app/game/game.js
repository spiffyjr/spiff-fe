'use strict';

angular.module('game', ['client', 'client.parser'])
    .config(function ($routeProvider) {
        $routeProvider.when('/game', { controller: 'GameCtrl', templateUrl: 'game/game.html' });
    })
    .controller('GameCtrl', function($scope, Client, Parser)
    {
        $scope.thoughts   = '';
        $scope.logons     = '';
        $scope.game       = '';
        $scope.room_objs  = '';
        $scope.room       = '';
        $scope.room_desc  = '';

        $scope.hands = {
            left: 'Empty',
            right: 'Empty',
            casting: 'None'
        };

        Parser.onHandUpdated = function(hand, item)
        {
            $scope.hands[hand] = item;
        };

        Parser.onLaunchUrl = function(url)
        {
            window.open('http://www.play.net/' + url);
        };

        Client.onText = function(text, stream)
        {
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

            $scope[stream] = text;
            $scope.$$phase || $scope.$apply();
        };
    });