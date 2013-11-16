'use strict';

angular.module('command', ['client'])
    .controller('CommandCtrl', function($scope, Client) {
        var index = 0;

        $scope.command = '';
        $scope.history = [];

        $scope.down = function(event) {
            event.preventDefault();
            if ($scope.history[index]) {
                $scope.command = $scope.history[index];
                index++;
                if (!$scope.history[index]) {
                    index = 0;
                }
            } else {
                index = 0;
            }
        };

        $scope.up = function(event) {
            event.preventDefault();
            if ($scope.history[index]) {
                $scope.command = $scope.history[index];
                index--;
                
                if (!$scope.history[index]) {
                    index = ($scope.history.length - 1);
                }
            } else {
                index = ($scope.history.length - 1);
            }
        };

        $scope.enter = function(event) {
            var cmd, mod = 0;
            if (event.ctrlKey || event.altKey) {
                event.preventDefault();
                if (event.ctrlKey) {
                    mod = $scope.history.length - 1;
                } else {
                    mod = $scope.history.length - 2;
                }

                if (!$scope.history[mod]) {
                    return;
                }
                cmd = $scope.history[mod];
            } else {
                cmd = $scope.command;
                $scope.history.push(cmd);

                index = ($scope.history.length - 1);
            }

            $scope.command = '';
            Client.send(cmd);
        };
    });