'use strict';

angular.module('header', [])
    .controller('HeaderCtrl', function($scope) {
        var appwin   = chrome.app.window.current();
        var header   = angular.element(document.getElementById('header'));

        $scope.manifest  = chrome.runtime.getManifest();
        $scope.maximized = appwin.isMaximized();

        $scope.restore  = function() {
            appwin.restore();
            $scope.maximized = false;
        };

        $scope.maximize = function() {
            appwin.maximize();
            $scope.maximized = true;
        };

        $scope.minimize = function() {
            appwin.minimize();
            $scope.maximized = false;
        };
    });