'use strict';

angular.module('Ionic03.directives', [])
    .directive('getGesture', function ($parse, $ionicGesture) {
        return {
            restrict: 'A',
            link: function ($scope, $element, attr) {
                var gestureName = attr['getGesture'];

                var fn = $parse(attr['getGestureAction']);
                console.log('OnHold Directive Link:', gestureName);

                var holdFn = function (e) {
                    //o('hold', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
                    console.log('Gesture', e.type);
                    return $scope.$apply(function () {
                        return fn($scope)(e);
                    });
                };
                var holdGesture = $ionicGesture.on(gestureName, holdFn, $element);

                $scope.$on('$destroy', function () {
                    $ionicGesture.off(holdGesture, gestureName, holdFn);
                });

            }
        }
    });
