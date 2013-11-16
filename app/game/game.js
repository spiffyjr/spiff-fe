'use strict';

angular.module('game', ['client'])
    .controller('GameCtrl', function($scope, Client) {
        $scope.buffers = {
            thoughts: [],
            logons: [],
            game: []
        };

        window.document.onkeydown = function(event) {
            if (event.which == 81 && event.altKey) {
                Client.send('stance offensive');
            } else if (event.which == 82 && event.altKey) {
                Client.send('stance defensive');
            }
            console.log(event);
        };

        Client.on('buffer', function(buffer, stream) {
            if (!stream) {
                stream = 'game'
            } else if (!$scope.buffers[stream]) {
                stream = null;
            }

            if (stream) {
                $scope.buffers[stream] = buffer.slice(-50);
                $scope.$$phase || $scope.$apply();

                var ele = angular.element(document.getElementById(stream));
                ele.prop('scrollTop', ele.prop('scrollHeight'));
            }
        });
    });