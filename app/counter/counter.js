'use strict';

angular.module('counter', ['client'])
    .controller('CounterCtrl', function($scope, $timeout, Client) {
        $scope.roundtime = 0;
        $scope.type      = 'hardrt';

        var handleRoundtime = function(value, type) {
            if ($scope.roundtime > 0) {
                return;
            }
            value = value * 10;
            var scale = (1000 / value);
            $scope.type      = type;
            $scope.roundtime = scale * value;

            var counter = setInterval(function() {
                value--;
                $scope.roundtime = value * scale;
                $scope.$apply();

                if (value == 0) {
                    clearInterval(counter);
                }
            }, 100);
        };

        Client.on('hardrt', function(value) {
            handleRoundtime(value, 'hardrt');
        });

        Client.on('softrt', function(value) {
            handleRoundtime(value, 'softrt');
        });
    });