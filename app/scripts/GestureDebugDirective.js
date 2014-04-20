/**
 * Created by Muly on 4/20/2014.
 */
'use strict';

angular.module('Ionic03.directives', [])
    .directive('holdSelect', function (Gesture) {
        return {
            restrict: 'C',
            link: function($scope, $element, $attr) {
                var output = angular.element(document.getElementById('output'));

                // Debug output function
                var o = function(type, d) {
                    console.log("o: "+type);
                };

                var releaseFn = function(e) {
                    o('release', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
                };
                var releaseGesture = Gesture.on('release', releaseFn, $element);

                var holdFn = function(e) {
                    o('hold', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
                };
                var holdGesture = Gesture.on('hold', holdFn, $element);

                $scope.$on('$destroy', function () {
                    Gesture.off(holdGesture, 'hold', holdFn);
                    Gesture.off(releaseGesture, 'release', releaseFn);
                });
            }
        };
    });

