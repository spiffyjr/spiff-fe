'use strict';

var app = angular.module('app');
app.controller('StatusCtrl', function($scope, Client, Parser) {
    $scope.status     = {};
    $scope.position    = 'standing';
    $scope.bleeding   = false;
    $scope.diseased   = false;
    $scope.poisoned   = false;

    Parser.onIndicator = function(type, value) {
        $scope[type] = value;
        $scope.$apply();
    };

    Parser.onProgressBar = function(name, current, max) {
        $scope.status[name] = { current: current, max: max };
        $scope.$apply();
    };
});