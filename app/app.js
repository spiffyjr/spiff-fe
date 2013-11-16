'use strict';
var app = angular.module('app', [
    'ngRoute',
    'ngSanitize',
    'ui.keypress',

    'directive.progress',

    'command',
    'counter',
    'game',
    'status'
]);

app.config(function ($routeProvider, $sceProvider) {
    $routeProvider.otherwise({redirectTo:'/'});
    $sceProvider.enabled(false);
});
