'use strict';
angular.module('Ionic03.controllers')

.controller('UnlockCtrl', function($scope, ConfigService, localStorageService, $log, $state) {
    var storageKey = 'unlock_code';
    var nextScreen = 'app.playlists';
    console.log('UnlockCtrl');
    $scope.dragIds = '';
    $scope.text = 'Welcome';

    var unlockCode = localStorageService.get(storageKey);
    $log.info('unlock_code', unlockCode);
    var state = 'unlock';
    var temp_unlockCode = '';
    if (!unlockCode) {
        state = 'set';
    }

    var updateState = function() {
        if (state ==='unlock') {
            $scope.text = 'Welcome';
        }
        else if (state ==='set') {
            $scope.text = 'Choose Unlock Code';
        }
        if (state ==='confirm') {
            $scope.text = 'Confirm Unlock Code';
        }
    };

    var checkUnlockCode = function(code) {
        $log.info('checkUnlockCode', code);
        if (state ==='unlock') {
            if (unlockCode === code) {
                $state.go(nextScreen);
            }
            else if (code === '709') {
                //reset code
                localStorageService.remove(storageKey);
                unlockCode = null;
                state = 'set';
                $log.info('Reset lock code');
                updateState();
            }
            else {
                $log.info('Code does not match, ask again', unlockCode, code);
            }
            //else do nothing, keep ask for code
        }
        else if (state ==='set') {
            temp_unlockCode = code;
            state = 'confirm';
            $log.info('Ask to confirm code', code);
            updateState();
        }
        else if (state ==='confirm') {
            if (temp_unlockCode === code) {
                //save code
                localStorageService.add(storageKey, code);
                $log.info('Save new unlock code', code);
                $state.go(nextScreen);
            }
            else {
                state = 'set';
                $scope.text = 'Code not match, choose';
                $log.info('Code not match, get a new code',temp_unlockCode, code);
            }
        }
    };

    updateState();

    //Calculate the unlock path
    $scope.onDragOver = function(e) {
        if (e.type==='tap') {
            console.log('Tap: ',e);
        }
        else if (e.type==='dragend') {
            checkUnlockCode($scope.dragIds);
            console.log('Unlock Pattern',$scope.dragIds);
        }
        else {
            var id = e.target.id;
            if (e.type==='dragstart') {
                $scope.dragIds = '';
                console.log('Drawstart ',e);

                if (e.srcElement) {
                    id = e.srcElement.id;
                    if (id.length == 0 && e.srcElement.firstChild) {
                        id = e.srcElement.firstChild.id;
                    }
                }
            }

            if (id.length>0) {
                if (!$scope.dragIds || id != $scope.dragIds.slice(-1)) {
                    $scope.dragIds += id;
                    //console.log('Drag Sequence',e);
                    console.log('Drag Sequence: ', $scope.dragIds);
                }
            }
        }
    }
});
