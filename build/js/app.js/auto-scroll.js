'use strict';

var app = angular.module('app');
app.directive('feAutoScroll', function() {
    var disableScroll = {};
    var scrollBuffer  = {};
    var prevScroll    = {};

    var updateBuffer = function(element)
    {
        var id = element.attr('id');

        if (id && scrollBuffer[id] && scrollBuffer[id].length > 0) {
            angular.forEach(scrollBuffer[id], function(buffer) {
                element.append(angular.element('<div>').html(buffer));
            });

            // trim extra buffer elements
            var children = element.children();

            if (children.length > 512) {
                children[0].remove();
                prevScroll[id] = element.prop('scrollTop');
            }

            element.prop('scrollTop', element.prop('scrollHeight'));
            scrollBuffer[id] = [];
        }
    };

    return {
        scope: {
            feAutoScroll: '=feAutoScroll',
            ngModel: '=ngModel'
        },
        link: function(scope, element) {
            var id = element.attr('id');

            element[0].onscroll = function(event) {
                var diff = element.prop('scrollTop') - prevScroll[id];

                if (diff > 0) {
                    var windowHeight = element.prop('scrollTop') + element.prop('clientHeight') + element.prop('clientTop');
                    if (disableScroll[id] && windowHeight >= element.prop('scrollHeight') - 5) {
                        updateBuffer(element);
                        disableScroll[id] = false;
                    }
                // todo: why is this scrolling extra?
                } else if (diff < -5) {
                    disableScroll[id] = true;
                }

                prevScroll[id] = element.prop('scrollTop');
            };

            scope.$watch('ngModel', function(value) {
                if (!id) {
                    return;
                }
                if (!scrollBuffer[id]) {
                    scrollBuffer[id] = [];
                }
                scrollBuffer[id].push(value);

                if (disableScroll[id]) {
                    return;
                }
                updateBuffer(element);
            });
        }
    };
});