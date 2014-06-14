'use strict';
// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Ionic03', [
    'ionic',
    'Ionic03.controllers',
    'Ionic03.AddCtrl',
    'Ionic03.BlogListSync',
    'Ionic03.DataSync',
    'Ionic03.dbTestCtrl',
    'Ionic03.testCtrl2',
    'Ionic03.GoogleApi',
    'Ionic03.MiscServices',
    'Ionic03.PushServices',
    'Ionic03.PostListCtrl',
    'Ionic03.testTouchEventsCtrl',
    'Ionic03.Unlock2Ctrl',
    'Ionic03.services',
    'Ionic03.directives',
    'Ionic03.RetrieveItemsService',
    'gapi',
    'pouchdb',
    'LocalStorageModule'
])


.run(function ($ionicPlatform, $state, $rootScope, $urlRouter, $log, $ionicPopup, $timeout,
               $ionicSideMenuDelegate,
               ConfigService, DataService, DataSync, PushServices, AppInit) {

    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        AppInit.init();
    });

        $ionicPlatform.registerBackButtonAction(

        //$ionicPlatform.onHardwareBackButton(
        function(event) {
            $log.log('onHardwareBackButton :', $state.current, $rootScope.$viewHistory.histories, $ionicSideMenuDelegate.isOpen());

            //$rootScope.$viewHistory.histories.stack
            var len = $rootScope.$viewHistory.histories.root.stack.length;
            var doDefault = false;

            if ($ionicSideMenuDelegate.isOpen()) {
                $ionicSideMenuDelegate.toggleLeft(false);
            }
            else if ($rootScope.$viewHistory.backView) { // there is a back view, go to it
                $rootScope.$viewHistory.backView.go();
            } else if (len>1) { // there is no back view, so close the app instead
                $state.go($rootScope.$viewHistory.histories.root.stack[len-2].stateName);
            } else {
                $log.log('onHardwareBackButton - Need to exit!');
                ionic.Platform.exitApp();
                doDefault = true;
            }

            if (!doDefault) {
                event.preventDefault();
            }
            return doDefault;
        }, 100);

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        console.log("$stateChangeStart", toState.name, event, toState, toParams, fromState, fromParams);

        var len = $rootScope.$viewHistory.histories.root.stack.length;
        console.log("$stateChangeStart, History", len, $rootScope.$viewHistory.histories.root.stack);
        //console.log("toState.authenticate", toState);

        //http://arthur.gonigberg.com/2013/06/29/angularjs-role-based-auth/
        //https://medium.com/opinionated-angularjs/4e927af3a15f
        $rootScope.currentState = toState.name;

        if (!ConfigService.isInitDone) {
            //$state.transitionTo('splash');
            //event.preventDefault();
            console.log("$stateChangeStart Called before init");
        }
        else if (toState.test) {
            $log.log('To State is test, no special handling')
        }
        else if (toState.authenticate) {
            console.log("$stateChangeStart", fromState.name, toState.name, DataSync.gapiLogin);
            if (ConfigService.locked) {
                if (toState.name !== 'unlock2') {
                    console.log("$stateChangeStart Force unlock screen");
                    $state.transitionTo('unlock2');
                    event.preventDefault();
                }
            }
            else if (!DataSync.gapiLogin) {
                if (toState.name !== 'login') {
                    console.log("$stateChangeStart Force login page");
                    $state.transitionTo('login');
                    event.preventDefault();
                }
            }
            else if (!ConfigService.blogId && toState.name !== 'app.bloglist' && toState.name !== 'login') {
                console.log("$stateChangeStart Force blog list page to select blog");
                $state.transitionTo('app.bloglist');
                event.preventDefault();
            }
        }
    });

    $rootScope.$on("event:DataSync:Notify", function (event, args) {
        console.log('APP event:DataSync:Notify', event, args);

        if (args.sent > 0) {
            PushServices.updateBlog(args.blogid)
                .then(function(answer) {
                    $log.log('Sent Push', args);
                })
                .catch(function(err) {
                    $log.error('Failed to send push', err);

                    $ionicPopup.alert({
                        title: 'Failed to send push',
                        content: err
                    }).then(function (res) {
                    });
                });
        }

        if (args.action === 'blogid') {
            PushServices.configure();
            DataSync.needSync = true;
            $log.log('Blog changed, Start Sync');
            DataSync.sync();
        }
    });

    $rootScope.$on("event:DataSync:StatusChange", function (event) {
        console.log('APP Recived DataSyn:StatusChange', $state.is('login'), $state.$current, event);
        console.log('State', $state.current, $rootScope.currentState);

        if (!$state.current.test && $state.current.name) {
            if (ConfigService.locked) {
                //Do nothing with the event
                $log.log('APP StatusChange - Do nothing, locked');
            }
            else if (!DataSync.gapiLogin && !$state.is('login')) {
                $state.go('login');
                $log.log('APP StatusChange -> Login');
            }
            else if (!ConfigService.blogId) {
                $state.go('app.bloglist');
                $log.log('APP StatusChange -> Bloglist');
            }
            else if (DataSync.gapiLogin && ($state.is('login'))) {
                $log.log('APP StatusChange -> Main Screen');
                $state.go(ConfigService.mainScreen);
            }

            if (DataSync.syncEnabled && DataSync.needSync && !DataSync.duringSync && DataSync.gapiLogin && !DataSync.error && ConfigService.blogId) {
                $log.log('APP StatusChange -> Start Sync');
                DataSync.sync();
            }
            else if (DataSync.error) {
                $log.log('APP StatusChange -> Error');
                if (!DataSync.error.done) {
                    $log.error('Sync error', DataSync.error);
                    DataSync.error.done = true;
                    if (DataSync.error.status == 401) {
                        $state.go('login');
                    }
                    else {
                        var err = 'Unknown';
                        if (DataSync.error.data) {
                            err = DataSync.error.data.error.message || 'Unknown';
                        }
                        else if (DataSync.error.message) {
                            err = DataSync.error.message;
                        }
                        else if (typeof DataSync.error === 'string') {
                            err = DataSync.error;
                        }

                        $ionicPopup.alert({
                            title: 'Blogger Sync Problem',
                            content: err
                        }).then(function (res) {
                        });
                    }
                }
            }
        }


        $log.log('APP StatusChange: End');
    });

    $rootScope.$on('Event:device-resume', function(event) {
        $timeout(function() {
            $log.log('Unlock controler, ready, hide splash screen');
            if (navigator.splashscreen) navigator.splashscreen.hide();
        }, 10);

        /*
        if (ConfigService.locked && ConfigService.unlockCode !== '*skip*' ) {
            $state.go('unlock2');
        }
        */
    });
})
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
])
.value('GoogleApp', {

    //client_id: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com', // localhost
    client_id: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com', //127.0.0.1
    client_secret: 'BCOBtps2R5GQHlGKb7mu7nQt',
    redirect_uri: 'http://localhost',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/blogger https://picasaweb.google.com/data/',
    access_type: 'offline',

    //GAPI On Browser
    apiKey: 'AIzaSyA78RO9-B7qEr-WXJULOq3u-n4C7RS9wz4',
    clientId: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com', // protractor, spy-js (need to change to 9001)
    //clientId: '44535440585-rshs1j4t1jc4qnp295fqmkr7jt12tbrh.apps.googleusercontent.com', // grunt serve
    scopes: [
        // whatever scopes you need for your app, for example:
        //'https://www.googleapis.com/auth/drive',
        //'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/blogger',
        'https://picasaweb.google.com/data/'
    ]

})


.config(function($provide){

    $provide.decorator("$exceptionHandler", function($delegate, $injector){
        return function(exception, cause){
            var $rootScope = $injector.get("$rootScope");
            var $state = $injector.get("$state");
            //$rootScope.addError({message:"Exception", reason:exception});
            console.log('My exception handler', exception, cause);

            $rootScope.err = {
                exception: exception,
                cause: cause };

            $state.go('exception');

            $delegate(exception, cause);
        };
    });

})
/*
.config(function ($httpProvider) {
    //http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
    //needed for the google sign, the original code was using jqery post
    //didn't work and have no way to debug this, happen only on device
    //so I go back to jquery post
    console.log('$httpProvider config');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    //
    // The workhorse; converts an object to x-www-form-urlencoded serialization.
    // @param {Object} obj
    // @return {String}
    //
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        console.log('$httpProvider Translate ['+query+']');

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
})
*/
.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

    //console.log('$stateProvider config');
    localStorageServiceProvider.setPrefix('Ionic03');

    $stateProvider
        .state('unlock2', {
            url: '/unlock2',
            abstract: false,
            templateUrl: 'templates/unlock2.html',
            controller: 'Unlock2Ctrl',
            authenticate: false
        })
        .state('login', {
            url: '/login',
            abstract: false,
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl',
            authenticate: false
        })
        .state('dbtest', {
            url: '/dbtest',
            abstract: false,
            templateUrl: 'templates/dbtest.html',
            controller: 'dbTestCtrl',
            authenticate: false,
            test: true
        })
        .state('test2', {
            url: '/test2',
            abstract: false,
            templateUrl: 'templates/test2.html',
            controller: 'testCtrl2',
            authenticate: false,
            test: true
        })
        .state('testInfinitScroll', {
            url: '/testInfinitScroll',
            abstract: false,
            templateUrl: 'templates/testInfinitScroll.html',
            controller: 'testInfinitScrollCtrl',
            authenticate: false
        })

        .state('testTouchEvents', {
            url: '/testTouchEvents',
            abstract: false,
            templateUrl: 'templates/testTouchEvents.html',
            controller: 'testTouchEventsCtrl',
            authenticate: false
        })

        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl',
            authenticate: true
        })

        .state('app.bloglist', {
            url: '/bloglist',
            views: {
                'menuContent': {
                    templateUrl: 'templates/bloglist.html',
                    controller: 'BlogListCtrl'
                }
            },
            resolve: {
                items: function (BlogListSync) {
                    return BlogListSync.getBlogList();
                }
            },
            authenticate: true
        })

        .state('app.setup', {
            url: '/setup',
            views: {
                'menuContent': {
                    templateUrl: 'templates/setup.html',
                    controller: 'SetupCtrl'
                }
            },
            authenticate: true
        })
        .state('app.playlists', {
            url: '/playlists',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlists.html',
                    controller: 'PostListCtrl'
                }
            },
            /*
            resolve: {
                items: function (DataService) {
                    return DataService.getItems(20);
                }
            },
            */
            authenticate: true
        })
        .state('app.add', {
            url: '/add',
            views: {
                'menuContent': {
                    templateUrl: 'templates/add.html',
                    controller: 'AddCtrl'
                }
            },
            resolve: {
                item: function (DataService) {
                    return DataService.getCurrentNewItem();
                }
            },
            authenticate: true
        })
        .state('exception', {
            url: '/exception',
            templateUrl: 'templates/exceptionPage.html',
            controller: 'ExceptionCtrl',
            authenticate: false
        })

        .state('app.diagnostic', {
            url: '/diagnostic',
            views: {
                'menuContent': {
                    templateUrl: 'templates/diagnostic.html',
                    controller: 'DiagnosticCtrl'
                }
            },
            authenticate: false
        });
    // if none of the above states are matched, use this as the fallback

    //$urlRouterProvider.otherwise('dbtest');
    $urlRouterProvider.otherwise('app.playlists');
})
.factory('AppInit', function($rootScope, $log, $q, $state, $location, $timeout,
                             localStorageService, ConfigService, DataService, DataSync, PushServices) {
        var init = function(startSync) {
            var unlockCode = localStorageService.get('unlock_code');
            ConfigService.unlockCode = unlockCode;

            DataService.selectBlog(false, false);
            DataSync.init()
                .then(function(answer) {
                    DataSync.needSync = true;
                })
                .then(function() {
                    PushServices.init();
                    ConfigService.isInitDone = true;
                    //ConfigService.locked = ionic.Platform.isWebView();


                    var nextScreen;
                    if (unlockCode === '*skip*' || !ConfigService.locked) {
                        nextScreen = ConfigService.mainScreen;
                        ConfigService.locked = false;
                    }
                    else {
                        nextScreen = 'unlock2';
                    }


                    var location = '';
                    if (window.location && window.location.hash) {
                        location = window.location.hash.substring(2);
                        if (location.length > 0 && !ionic.Platform.isWebView()) {
                            nextScreen = location.replace('/', '.');
                        }
                    }


                    $log.log('AppInit Init', ConfigService.version, startSync, DataSync.gapiLogin, nextScreen, $state.current, location, nextScreen);
                    //$location.path = nextScreen;
                    $state.go(nextScreen);
                    $timeout(function() {
                        if (navigator.splashscreen) navigator.splashscreen.hide();
                    });
                });
        };

        return {
            init: init,
        };
    });

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };
}

//http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
//Sample: String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : 'undefined'
                ;
        });
    };
}
