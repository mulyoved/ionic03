'use strict';
angular.module('Ionic03.testTouchEventsCtrl', [])

.controller('testTouchEventsCtrl', function ($scope, ConfigService, localStorageService, $log, $state) {
    $scope.dragIds = '';
    $scope.text = 'Welcome';

    $scope.onDragOver = function (e) {
        $log.log('DragOver', e.type, e.srcElement, e.target);
        /*
        if (e.type === 'tap') {
            console.log('Tap: ', e);
        }
        else if (e.type === 'dragend') {
            console.log('Unlock Pattern', $scope.dragIds);
        }
        else {
            var id = e.target.id;
            if (e.type === 'dragstart') {
                console.log('Drawstart ', e);

                if (e.srcElement) {
                    id = e.srcElement.id;
                    if (id.length == 0 && e.srcElement.firstChild) {
                        id = e.srcElement.firstChild.id;
                    }
                }
            }

            if (id.length > 0) {
                if (!$scope.dragIds || id != $scope.dragIds.slice(-1)) {
                    $scope.dragIds += id;
                    //console.log('Drag Sequence',e);
                    console.log('Drag Sequence: ', $scope.dragIds);
                }
            }
        }
        */
    }
});
