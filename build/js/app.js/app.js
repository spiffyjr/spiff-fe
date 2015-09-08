'use strict';
var app = angular.module('app', [
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'ngRoute',
    'ngSanitize',

    'ui'
]);

app
    .config(function ($routeProvider, $sceProvider) {
        $routeProvider.when('/', { templateUrl: 'view/index.html' });
        $routeProvider.when('/game', { controller: 'GameCtrl', templateUrl: 'view/game.html' });
        $routeProvider.when('/settings', { controller: 'SettingsCtrl', templateUrl: 'view/settings.html' });
        $routeProvider.otherwise({ redirectTo:'/' });
        $sceProvider.enabled(false);
    })
    .config(function ($mdThemingProvider) {
        //$mdThemingProvider.theme('default').dark();

        var orangeMap = $mdThemingProvider.extendPalette('orange', {
            '800': '333333'
        });
        $mdThemingProvider.definePalette('orange', orangeMap);

        //black background color
        var black = $mdThemingProvider.extendPalette('grey', {
            'A100': '222222'
        });
        $mdThemingProvider.definePalette('black', black);

        $mdThemingProvider.theme('default')
            .dark()
            .accentPalette('grey', {
                'default': '200'
            })
            .primaryPalette('orange', {
                'default': '800'
            })
            .backgroundPalette('black');
    });