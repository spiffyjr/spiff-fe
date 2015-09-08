'use strict';

var app = angular.module('app');
app.controller('HeaderCtrl', function($scope) {
    var appwin   = chrome.app.window.current();
    var header   = angular.element(document.getElementById('header'));

    $scope.collapsed = false;
    $scope.manifest  = chrome.runtime.getManifest();

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