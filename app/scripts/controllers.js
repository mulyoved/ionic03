'use strict';
angular.module('Ionic03.controllers', [])

.controller('AppCtrl', function ($scope) {
    console.log('AppCtrl');
})

.controller('LoginCtrl', function ($scope, $state, GoogleApp, GoogleApi, GAPI, ConfigService, DataSync) {
    console.log('LoginCtrl');
    $scope.googleClientId = GoogleApp.clientId;
    $scope.loading = false;
    $scope.canCancelSelection = ConfigService.blogId;

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
            DataSync.init()
                .then(function() {
                    $state.go(ConfigService.mainScreen);
                })
                .catch(function(err) {
                   $log.error('Login failed', err);
                });
            /*
            return GoogleApi.getUserInfo();
        }).then(function(userInfo) {
            //Get and save user name
            */

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

.controller('DiagnosticCtrl', function ($scope, $state, ConfigService, DataSync) {
        $scope.ConfigService  = ConfigService;
        $scope.DataSync = DataSync;

    $scope.syncEnabled = DataSync.syncEnabled;
    $scope.blogName = ConfigService.blogName;
    $scope.userName = ConfigService.username;


    $scope.gapiLogin = DataSync.gapiLogin;
    $scope.error = DataSync.error;
    $scope.duringSync = DataSync.duringSync;
    $scope.needSync = DataSync.needSync;

    $scope.sync = function() {
        DataSync.sync();
    };
    $scope.login = function() {
        $state.go('login');
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
    };

    $scope.login = function() {
        $state.go('login');
    };
})

.controller('BlogListCtrl', function ($scope, $state, $log, ConfigService, DataService, BlogListSync, items) {
    $scope.items = items;
    $scope.canCancelSelection = ConfigService.blogId.length > 0;
    //$scope.showBackButton(false);

    $scope.doRefresh = function() {
        console.log('Refreshing!');
        BlogListSync.loadBlogList()
        .then(function(answer) {
            $log.log('loadBlogList Completed Refresh Items', answer);
            //console.table(answer);
            $scope.items = answer;
            $scope.$broadcast('scroll.refreshComplete');
        }).catch(function(err) {
            $log.error('loadBlogList Error', err);
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.selectBlog = function(item) {
        $log.log('SelectBlog', item);
        DataService.selectBlog(item.id, true);
        $state.go(ConfigService.mainScreen);

        /*
            .then(function() {
                $state.go(ConfigService.mainScreen);
            })
            .catch(function(err) {
                $log.error('selectBlog Error', err);
            });
        */
    };

    $scope.blogInfo = function(item) {
        $log.log('BlogInfo', item);
    };

    $scope.cancel = function() {
        if (ConfigService.blogId) {
            $state.go(ConfigService.mainScreen);
        }
    }
})

.controller('SetupCtrl', function ($rootScope, $scope, $state, $ionicPopup, $log, $ionicNavBarDelegate,
                                   GoogleApi, BlogListSync, DataService, localStorageService, ConfigService,
                                   PushServices) {
    $scope.setup = {
        enablePushNotification: ConfigService.enablePushNotification,
        enablePushNotification_Sound: ConfigService.enablePushNotification_Sound,
        enablePushNotification_Vibration: ConfigService.enablePushNotification_Vibration,
        enableLockScreen: ConfigService.unlockCode !== '*skip*',
        version: 'unknown' // will be replaced
    };

    if (typeof cordova != 'undefined' && cordova.getAppVersion != 'undefined') {
        cordova.getAppVersion(function (version) {
            $scope.setup.version = version;
        });
    }

    $scope.cancel = function() {
        $state.go(ConfigService.mainScreen);
        //$ionicNavBarDelegate.back(); // not working not sure why
    };

    var done = function(text, nextScreen) {
        $ionicPopup.alert({
            title: 'Done',
            content: text
        }).then(function (res) {
            if (nextScreen) {
                $log.log('SetupCtrl, go ->', nextScreen);
                $state.go(nextScreen);
            }
        });
    };

    $scope.clearStorage = function() {
        DataService.deletedb()
            .then(function(answer) {
                return done('Clear storage');
            })
            .catch(function(err) {
                $log.error('Failed to delete', err);
            });

    };

    $scope.reset = function() {
        DataService.deletedb()
            .then(function() {
                GoogleApi.clearToken();
                BlogListSync.clearStorage();
                localStorageService.remove('selected_blog');
                localStorageService.remove('unlock_code');
                ConfigService.unlockCode = '';
                return GoogleApi.logout();
            })
            .then(function() {
                return done('Reset', 'unlock2');
            });
    };

    $scope.googleLogout = function() {
        GoogleApi.logout()
            .then(function() {
                return done('Google Logout', 'login');
            });
    };

    $scope.diagnostic = function() {
        $state.go('app.diagnostic');
    };

    $scope.selfTest = function() {
        $state.go('dbtest');
    };

    $scope.save = function() {
        var nextScreen = ConfigService.mainScreen;
        if ($scope.setup.enableLockScreen && ConfigService.unlockCode === '*skip*') {
            ConfigService.unlockCode = '';
            ConfigService.locked = true;
            localStorageService.remove('unlock_code');
            nextScreen = 'unlock2';
        }
        else if (!$scope.setup.enableLockScreen && ConfigService.unlockCode !== '*skip*') {
            ConfigService.unlockCode = '*skip*';
            localStorageService.add('unlock_code', ConfigService.unlockCode);
            ConfigService.locked = false;
        }

        /*
        if ($scope.setup.enablePushNotification != ConfigService.enablePushNotification) {
            ConfigService.enablePushNotification = $scope.setup.enablePushNotification;

            if (ConfigService.enablePushNotification) {
                PushServices.listenToBlogs([ConfigService.blogId]);
            }
            else {
                PushServices.listenToBlogs([]);
            }
        }
        */

        ConfigService.enablePushNotification = $scope.setup.enablePushNotification
        ConfigService.enablePushNotification_Sound = $scope.setup.enablePushNotification_Sound;
        ConfigService.enablePushNotification_Vibration = $scope.setup.enablePushNotification_Vibration;
        PushServices.configure();

        if (nextScreen) {
            $log.log('SetupCtrl go -> ', nextScreen);
            $state.go(nextScreen);
        }
    };

})

.controller('PlaylistCtrl', function ($scope, ConfigService, item) {
    $scope.title = ConfigService.blogName;
    console.log(item);
})

.controller('testInfinitScrollCtrl', function ($scope, $timeout, $log) {
    $log.log('testInfinitScrollCtrl');

    $scope.noMoreItemsAvailable = false;

    var addItemes = function() {
        for (var i=0; i<10; i++) {
            $scope.items.push({ id: $scope.items.length});
        }
    };

    $scope.loadMore = function() {

        $timeout(function() {
            addItemes();

            if ($scope.items.length >= 99) {
                $scope.noMoreItemsAvailable = true;
            }
            $log.log('Load More: Total', $scope.items.length);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 5000);
    };

    $scope.items = [];
    addItemes();
});
