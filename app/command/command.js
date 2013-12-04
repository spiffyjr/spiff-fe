'use strict';

angular.module('command', ['client'])
    .controller('CommandCtrl', function($scope, $location, Client) {
        var index = 0;

        $scope.command = '';
        $scope.history = [];

        window.document.onkeydown = function(event) {
            if (event.location == 3) {
                var dir = null;

                switch (event.keyIdentifier.toLowerCase()) {
                    case 'up':
                        dir = 'n';
                        break;
                    case 'down':
                        dir = 's';
                        break;
                    case 'left':
                        dir = 'w';
                        break;
                    case 'right':
                        dir = 'e';
                        break;
                    case 'pageup':
                        dir = 'ne';
                        break;
                    case 'pagedown':
                        dir = 'se';
                        break;
                    case 'insert':
                        dir = 'u';
                        break;
                    case 'u+007f':
                        dir = 'd';
                        break;
                    case 'home':
                        dir = 'nw';
                        break;
                    case 'end':
                        dir = 'sw';
                        break;
                }

                if (dir) {
                    $scope.command = '';
                    Client.send(dir);

                    return;
                }
            }

            var key = String.fromCharCode(event.keyCode).toLowerCase();

            if (event.altKey) {
                key = "alt+" + key;
            } else if (event.ctrlKey) {
                key = "ctrl+" + key;
            } else if (event.shiftKey) {
                key = "shift+" + key;
            }

            var macro = Client.settings.macros[key];
            if (!macro) {
                return;
            }

            var cmds = macro.split(/(\\[xr?])/);
            var send = '';
            angular.forEach(cmds, function(cmd) {
                if (cmd.trim().length == 0) {
                    return;
                }

                if (cmd == '\\x') {
                    $scope.command = '';
                } else if (cmd == '\\r') {
                    Client.send(send);
                    send = '';
                } else {
                    send = send + cmd;
                }
            });
        };

        $scope.settings = function() {
            $location.path('/settings');
        };

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