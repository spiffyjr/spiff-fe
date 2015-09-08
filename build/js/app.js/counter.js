'use strict';

var app = angular.module('app');
app.controller('CounterCtrl', function($scope, Parser) {
    $scope.max        = 1000;
    $scope.roundtime  = 0;
    $scope.type       = 'hard';

    var counterInterval;
    var updateTime = 50;

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