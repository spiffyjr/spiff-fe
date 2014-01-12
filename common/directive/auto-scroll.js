'use strict';

angular.module('directive.autoscroll', [])
    .directive('feAutoScroll', function() {
        var disableScroll = {};
        var scrollBuffer  = {};

        return {
            scope: {
                feAutoScroll: '=feAutoScroll',
                ngModel: '=ngModel'
            },
            link: function(scope, element) {
                var id = element.attr('id'),
                    prevScroll = element.prop('scrollTop');

                element[0].onscroll = function(event) {
                    var diff = element.prop('scrollTop') - prevScroll;

                    if (diff > 0) {
                        var windowHeight = element.prop('scrollTop') + element.prop('clientHeight') + element.prop('clientTop');
                        if (windowHeight >= element.prop('scrollHeight') - 5) {
                            if (id && scrollBuffer[id] && scrollBuffer[id].length > 0) {
                                angular.forEach(scrollBuffer[id], function(buffer) {
                                    element.append(angular.element('<div>').html(buffer));
                                });
                                scrollBuffer[id] = [];
                                element.prop('scrollTop', element.prop('scrollHeight'));
                            }

                            disableScroll[id] = false;
                        }
                    // todo: why is this scrolling extra?
                    } else if (diff < -1) {
                        disableScroll[id] = true;
                    }

                    prevScroll = element.prop('scrollTop');
                };

                scope.$watch('ngModel', function(value) {
                    if (!id || disableScroll[id]) {
                        if (id) {
                            if (!scrollBuffer[id]) {
                                scrollBuffer[id] = [];
                            }
                            scrollBuffer[id].push(value);
                        }

                        return;
                    }

                    element.append(angular.element('<div>').html(value));

                    // trim extra buffer elements
                    var children = element.children();

                    if (children.length > 1024) {
                        children[0].remove();
                    }

                    element.prop('scrollTop', element.prop('scrollHeight'));
                });
            }
        };
    });