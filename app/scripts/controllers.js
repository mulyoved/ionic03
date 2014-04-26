'use strict';
angular.module('Ionic03.controllers', [])

.controller('AppCtrl', function ($scope) {
    console.log('AppCtrl');
})

.controller('LoginCtrl', function ($scope, $state, GoogleApp, GoogleApi, GAPI, ConfigService, DataSync) {
    console.log('LoginCtrl');
    $scope.googleClientId = GoogleApp.clientId;

    $scope.login = function() {
        console.log("Google Login: ", ionic.Platform.device(), ionic.Platform.isCordova());

        var p;
        if (ionic.Platform.isCordova()) {
            //Show the consent page
            p = GoogleApi.authorize({
                client_id: GoogleApp.client_id,
                client_secret: GoogleApp.client_secret,
                redirect_uri: GoogleApp.redirect_uri,
                scope: GoogleApp.scope
            });
        }
        else {
            GoogleApp.scopes = GoogleApp.scope.split(" ");
            p = GAPI.init();
        }

        p.then(function (data) {
            console.log('Authorize: Success', data);
            if (!ionic.Platform.isCordova()) {
                GoogleApi.setToken(data.oauthToken);
            }

            //Reinit after we get new token
            DataSync.init();

            $state.go(ConfigService.mainScreen);
        }, function (data) {
            //Show an error message if access was denied
            if (data) {
                console.log('Show an error message if access was denied ', data.error);
            }
            else {
                console.log('GoogleApi.authorize catch, but no data object');
            }
        });

    }

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

.controller('PlaylistsCtrl', function ($scope, ConfigService, $ionicNavBarDelegate, $ionicViewService, items) {
    $scope.title = ConfigService.blogName();
    $ionicNavBarDelegate.showBackButton(false);
    $ionicViewService.clearHistory();

    $scope.playlists = items;


})

.controller('PlaylistCtrl', function ($scope, ConfigService, item) {
    $scope.title = ConfigService.blogName();
    console.log(item);
});
