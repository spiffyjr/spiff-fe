'use strict';

angular.module('status', ['client', 'client.parser'])
    .controller('StatusCtrl', function($scope, Client, Parser) {
        $scope.status    = {};
        $scope.roundtime = 5;

        Parser.onProgressBar = function(name, current, max) {
            $scope.status[name] = {
                current: current,
                max: max
            };
            $scope.$apply();
        };
    });