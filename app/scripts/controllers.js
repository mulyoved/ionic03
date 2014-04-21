'use strict';
angular.module('Ionic03.controllers', [])

.controller('AppCtrl', function ($scope) {
    console.log('AppCtrl');
})

.controller('LoginCtrl', function ($scope, GoogleApp) {
    console.log('LoginCtrl');
    $scope.googleClientId = GoogleApp.clientId;
})

.controller('AddCtrl', function ($scope, ConfigService, $ionicNavBarDelegate, item) {
    $scope.title = ConfigService.blogName();
    $scope.item = item;

    $scope.save = function () {

        console.log('Going to save: ', $scope.item);

        console.log('Save');
        item.save(item);
        $ionicNavBarDelegate.back();
    };

    $scope.cancel = function () {
        console.log('Cancel');
        $ionicNavBarDelegate.back();
    };

    $scope.picture = function () {
        console.log('TBD');
    }
})

.controller('PlaylistsCtrl', function ($scope, ConfigService, items) {
    $scope.title = ConfigService.blogName();
    $scope.playlists = items;
})

.controller('PlaylistCtrl', function ($scope, ConfigService, item) {
    $scope.title = ConfigService.blogName();
    console.log(item);
});
