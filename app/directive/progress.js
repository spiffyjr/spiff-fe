'use strict';

var app = angular.module('app');
app.directive('feProgress', function() {
        return {
            scope: {
                feProgress: '=feProgress',
                feProgressType: '=feProgressType'
            },
            link: function(scope, element) {
                scope.$watch('feProgress', function(value) {
                    element.attr('value', value);
                    element.attr('class', scope.feProgressType);
                });
            }
        };
    });