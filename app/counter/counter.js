'use strict';

angular.module('counter', ['client', 'client.parser'])
    .controller('CounterCtrl', function($scope, Parser) {
        var roundtimes = { hard: 0, soft: 0, stun: 0 };

        $scope.max        = 1000;
        $scope.roundtime  = 0;
        $scope.type       = 'hard';

        var counterInterval;
        var updateTime = 250;

        Parser.onRoundTime = function(type, value) {
            if (value < 0) {
                return;
            }

            clearInterval(counterInterval);

            var scale = ($scope.max / value);

            $scope.type      = type;
            $scope.roundtime = scale * value;

            counterInterval = setInterval(function() {
                value = value - updateTime;
                $scope.roundtime = value * scale;
                $scope.$apply();

                if (value < 0) {
                    clearInterval(counterInterval);
                    counterInterval = null;
                }
            }, updateTime);
        }
    });