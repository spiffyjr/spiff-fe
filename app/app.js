'use strict';
var app = angular.module('app', [
    'ngRoute',
    'ngSanitize',

    'ui.bootstrap.collapse',
    'ui.bootstrap.modal',
    'ui.keypress',

    'directive.autoscroll',
    'directive.progress',

    'command',
    'counter',
    'index',
    'game',
    'settings',
    'status'
]);

app.config(function ($routeProvider, $sceProvider) {
    $routeProvider.when('/', { templateUrl: 'index/index.html' });
    $routeProvider.otherwise({redirectTo:'/'});
    $sceProvider.enabled(false);
});
