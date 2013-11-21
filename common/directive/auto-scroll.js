'use strict';

angular.module('directive.autoscroll', [])
    .directive('feAutoScroll', function() {
        var disable = false;

        return {
            scope: { feAutoScroll: '=' },
            link: function(scope, element) {
                element[0].onmousewheel = function(event) {
                    if (event.wheelDelta < 0) {
                        if ((element.prop('scrollTop') + element.prop('clientHeight') + element.prop('clientTop')) == element.prop('scrollHeight')) {
                            //disable = false;
                        }
                    } else {
                        //disable = true;
                    }
                };

                scope.$watch(function() { return element.prop('scrollHeight') }, function(value) {
                    if (disable) {
                        return;
                    }

                    element.prop('scrollTop', value);
                });
            }
        };
    });