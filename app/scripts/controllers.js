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
        if (ionic.Platform.isWebView() && ionic.Platform.platform() !== 'generic' /* ripple */) {
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

.controller('AddCtrl', function ($scope, ConfigService, $ionicNavBarDelegate, DataService, $timeout, item) {
    $scope.title = ConfigService.blogName();
    $scope.item = item;

    $scope.save = function () {

        console.log('Going to save: ', $scope.item);

        DataService.saveItem(item);
        $ionicNavBarDelegate.back();
    };

    $scope.cancel = function () {
        console.log('Cancel');
        $ionicNavBarDelegate.back();
    };

    $scope.picture = function () {
        console.log('TBD');
    };

    //not sure why, seem like bug in chrom, textinput is not working correctly
    //force some resize fix the problem
    $timeout(function() {
        $scope.applyClass = true;
    }, 20);
})

.controller('PlaylistsCtrl', function ($rootScope, $scope, $state, $log, ConfigService,
                                       $ionicNavBarDelegate, $ionicViewService, DataSync, DataService, HTMLReformat,
                                       items) {

    var iconError = 'icon ion-alert';
    var iconOk = 'ion-ios7-star-outline';
    var iconSync = 'ion-looping';
    var startRefresh = true;

    $log.log('!!!! PlaylistsCtrl ', items);

    var updateIcon = function() {
        if (!DataSync.gapiLogin || DataSync.error) {
            $scope.syncIcon = iconError;
        }
        else if (DataSync.duringSync) {
            $scope.syncIcon = iconSync;
        }
        else if (DataSync.needSync) {
            $scope.syncIcon = iconError;
        }
        else {
            $scope.syncIcon = iconOk;
        }

        if (startRefresh && !DataSync.duringSync) {
            $scope.$broadcast('scroll.refreshComplete');
            startRefresh = false;
        }

        $log.log('Updated icon ', $scope.syncIcon);
    };

    $scope.sync = function() {
        if ($scope.syncIcon === iconError) {
            $state.go('app.diagnostic');
        }
        else if (!DataSync.duringSync) {
            DataSync.sync();
        }
    };

    $scope.add = function() {
        $state.go('app.add');
    };

    $scope.title = ConfigService.blogName();
    $ionicNavBarDelegate.showBackButton(false);
    $ionicViewService.clearHistory();
    $scope.syncIcon = "ok";

    var updateItemList = function() {
        var p = DataService.getItems();
        p.then(function (answer) {
            $scope.items = answer;
            $log.log('PlaylistsCtrl: DataService.getItems: Set PlayList !', answer);
        }, function (err) {
            $log.error('DataService.getItems Failed ', err);
        });
    };

    $scope.$on("event:DataSync:StatusChange", function (event) {
        $log.log('PlaylistsCtrl: Recived: event:DataSync:StatusChange');
        updateIcon();
    });

    $scope.$on("event:DataSync:DataChange", function (event) {
        $log.log('PlaylistsCtrl: Recived: event:DataSync:DataChange');
        updateItemList();
    });

    $scope.doRefresh = function() {
        console.log('Refreshing!');
        startRefresh = true;
        DataSync.sync();
    };

    $scope.show = function(item) {
        var results = HTMLReformat.reformat(item.doc.content);
        //$log.log(item);
        return results;
    };

    $scope.items = items;
    updateIcon();
    updateItemList();

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
