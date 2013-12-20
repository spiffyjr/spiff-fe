'use strict';

angular.module('directive.autoscroll', [])
    .directive('feAutoScroll', function() {
        var disableScroll = {};

        return {
            scope: {
                feAutoScroll: '=feAutoScroll',
                ngModel: '=ngModel'
            },
            link: function(scope, element) {
                var id = element.attr('id');

                element[0].onmousewheel = function(event) {
                    if (event.wheelDelta < 0) {
                        var windowHeight = element.prop('scrollTop') + element.prop('clientHeight') + element.prop('clientTop');

                        if (windowHeight >= element.prop('scrollHeight')) {
                            disableScroll[id] = false;
                        }
                    } else {
                        disableScroll[id] = true;
                    }
                };

                scope.$watch('ngModel', function(value) {
                    element.append(angular.element('<div>').html(value));

                    // trim extra buffer elements
                    var children = element.children();

                    if (children.length > 1024) {
                        children[0].remove();
                    }

                    if (!id || disableScroll[id]) {
                        return;
                    }

                    element.prop('scrollTop', element.prop('scrollHeight'));
                });
            }
        };
    });