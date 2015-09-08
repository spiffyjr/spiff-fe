'use strict';

var app = angular.module('app');
app.controller('ToolbarCtrl', function($scope, $mdSidenav) {
    var appwin   = chrome.app.window.current();

    $scope.collapsed = false;
    $scope.manifest  = chrome.runtime.getManifest();

    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

    $scope.close = function() {
        appwin.close();
    };

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