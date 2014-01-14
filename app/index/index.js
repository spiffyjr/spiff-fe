'use strict';

angular.module('index', [])
    .controller('IndexCtrl', function($scope, $location, $modal, Client) {
        $scope.hostname = '127.0.0.1';
        $scope.port     = '8000';

        //Client.connect('127.0.0.1', 8000);
        //$location.path('/settings');

        $scope.connect = function(hostname, port) {
            Client.connect(hostname, Number(port), function(result) {
                if (result < 0) {
                    $modal.open({
                        templateUrl: 'index/modal-connect-failed.html',
                        scope: $scope,
                        controller: function($scope, $modalInstance) {
                            $scope.ok = function() {
                                $modalInstance.close();
                            };
                        }
                    });
                    Client.disconnect();
                } else {
                    Client.send('look');
                    Client.send('stance');
                    Client.send('glance');
                    $location.path('/game');
                    $scope.$apply();
                }
            });
        };
    });