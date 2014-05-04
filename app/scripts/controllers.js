'use strict';
angular.module('Ionic03.controllers', [])

.controller('AppCtrl', function ($scope) {
    console.log('AppCtrl');
})

.controller('LoginCtrl', function ($scope, $state, GoogleApp, GoogleApi, GAPI, ConfigService, DataSync) {
    console.log('LoginCtrl');
    $scope.googleClientId = GoogleApp.clientId;
    $scope.loading = false;

    $scope.login = function() {
        $scope.loading = true;
        console.log("Google Login: ", ionic.Platform.device(), ionic.Platform.platform(), ionic.Platform.isWebView());

        var p;
        if (ionic.Platform.isWebView()) {
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
            if (!ionic.Platform.isWebView()) {
                GoogleApi.setToken(data.oauthToken);
            }

            //Reinit after we get new token
            DataSync.init();
            /*
            return GoogleApi.getUserInfo();
        }).then(function(userInfo) {
            //Get and save user name
            */
            $state.go(ConfigService.mainScreen);
        }, function (data) {
            //Show an error message if access was denied
            if (data) {
                console.log('Show an error message if access was denied ', data.error);
            }
            else {
                console.log('GoogleApi.authorize catch, but no data object');
            }
            $scope.loading = false;
        });

    }

})

.controller('DiagnosticCtrl', function ($scope, ConfigService, DataSync) {
    $scope.gapiLogin = DataSync.gapiLogin;
    $scope.error = DataSync.error;
    $scope.duringSync = DataSync.duringSync;
    $scope.needSync = DataSync.needSync;
    $scope.sync = function() {
        DataSync.sync();
    }
})

.controller('ExceptionCtrl', function ($rootScope, $scope, $state, ConfigService) {
    console.log('ExceptionCtrl');

    if ($rootScope.err) {
        $scope.exception = $rootScope.err.exception;
        $scope.cause = $rootScope.err.cause;
    }
    else {
        $scope.exception = 'unknown';
        $scope.cause = 'unknown';
    }

    $scope.goback = function() {
        console.log('goback');
        $state.go(ConfigService.mainScreen);
    }
})

.controller('PlaylistCtrl', function ($scope, ConfigService, item) {
    $scope.title = ConfigService.blogName();
    console.log(item);
});
