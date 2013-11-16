'use strict';

angular.module('directive.autoScroll', [])
    .directive('autoScroll', function() {
        return {
            scope: { autoScroll: '=' },
            template: '<div ng-repeat="line in autoScroll track by $index" ng-bind-html="line"></div>',
            link: function(scope, element) {
                var height = element.prop('scrollHeight');
                scope.$watch(height, function(value) {
                    console.log(element.prop('scrollHeight'));
                    if (!value) {
                        return;
                    }

                    element.prop('scrollTop', element.prop('scrollHeight'));
                });
            }
        };
    });