'use strict';
var app = angular.module('app', [
    'ngRoute',
    'ngSanitize',

    'ui.bootstrap',
    'ui.keypress',

    'directive.autoscroll',
    'directive.progress',

    'command',
    'counter',
    'header',
    'index',
    'indicator',
    'game',
    'settings',
    'status'
]);

app.config(function ($routeProvider, $sceProvider) {
    $routeProvider.when('/', { templateUrl: 'index/index.html' });
    $routeProvider.otherwise({redirectTo:'/'});
    $sceProvider.enabled(false);
});
