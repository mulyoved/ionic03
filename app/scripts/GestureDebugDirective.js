'use strict';

angular.module('Ionic03.directives',[])
    .directive('onhold', function ($parse, Gesture) {
        return {
            restrict: 'A',
            link: function($scope, $element, attr) {
                //console.log('onhold '+attr['onhold']);
                var fn = $parse(attr['onhold'])

                /*
                 var releaseFn = function(e) {
                 //o('release', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
                 };
                 var releaseGesture = Gesture.on('release', releaseFn, $element);
                 */

                var holdFn = function(e) {
                    //o('hold', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
                    console.log('onhold v3 '+attr['onhold']);
                    return $scope.$apply(function() {
                        return fn($scope)(e);
                    });
                };
                var holdGesture = Gesture.on('hold', holdFn, $element);

                $scope.$on('$destroy', function () {
                    Gesture.off(holdGesture, 'hold', holdFn);
                    //Gesture.off(releaseGesture, 'release', releaseFn);
                });

            }
        }
    });
