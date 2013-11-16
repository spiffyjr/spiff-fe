'use strict';

angular.module('status', ['client'])
    .controller('StatusCtrl', function($scope, Client) {
        $scope.status    = {};
        $scope.roundtime = 5;

        Client.on('status', function(name, current, max) {
            $scope.status[name] = {
                current: current,
                max: max
            }
        });
    });