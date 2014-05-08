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
    'Ionic03.services',
    'Ionic03.directives',
    'gapi',
    'pouchdb',
    'LocalStorageModule'
])


.run(function ($ionicPlatform, $state, $rootScope, $urlRouter, $log, $ionicPopup, ConfigService, DataService, DataSync) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        //start async load of GAPI/Auth2
        DataSync.init();
    });

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        //console.log("$stateChangeStart", event, toState, toParams, fromState, fromParams);
        //console.log("toState.authenticate", toState);

        //http://arthur.gonigberg.com/2013/06/29/angularjs-role-based-auth/
        //https://medium.com/opinionated-angularjs/4e927af3a15f
        if (false) {

            if (!ConfigService.login) {
                if (toState.authenticate) {
                    console.log("Redirect to login");
                    $state.transitionTo("dbtest");
                    event.preventDefault();
                }
            }
            else if (toState.name == 'login') {
                $state.transitionTo(ConfigService.mainScreen);
                event.preventDefault();
            }
        }

    });

    $rootScope.$on("event:DataSync:StatusChange", function (event) {
        console.log('APP Recived DataSync:StatusChange', $state.is('login'), event);
        if (DataSync.gapiLogin && $state.is('login')) {
            $state.go(ConfigService.mainScreen);
        }
        else if (!DataSync.gapiLogin && !$state.is('login')) {
            $state.go('login');
        }

        if (DataSync.needSync && !DataSync.duringSync && DataSync.gapiLogin && !DataSync.error) {
            DataSync.sync();
        }
        else if (DataSync.error) {
            if (!DataSync.error.done) {
                $log.error('Sync error', DataSync.error);
                DataSync.error.done = true;
                if (DataSync.error.status == 401) {
                    $status.go('login');
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
    });

    //Todo: read from local storage
    DataService.selectBlog({ id: '4462544572529633201', name: 'Unknown'});
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

    //GAPI On Browser
    apiKey: 'AIzaSyA78RO9-B7qEr-WXJULOq3u-n4C7RS9wz4',
    //clientId: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com', // spy-js
    clientId: '44535440585-rshs1j4t1jc4qnp295fqmkr7jt12tbrh.apps.googleusercontent.com', // grunt serve
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

            $state.go('exception_page');

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

    console.log('$stateProvider config');
    localStorageServiceProvider.setPrefix('Ionic03');

    $stateProvider
        .state('unlock', {
            url: '/unlock',
            abstract: false,
            templateUrl: 'templates/unlock.html',
            controller: 'UnlockCtrl',
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
            authenticate: false
        })
        .state('testInfinitScroll', {
            url: '/testInfinitScroll',
            abstract: false,
            templateUrl: 'templates/testInfinitScroll.html',
            controller: 'testInfinitScrollCtrl',
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

        .state('app.browse', {
            url: '/browse',
            views: {
                'menuContent': {
                    templateUrl: 'templates/browse.html'
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
            resolve: {
                items: function (DataService) {
                    return DataService.getItems(20);
                }
            },
            authenticate: true
        })
        .state('app.single', {
            url: '/playlists/:playlistId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlist.html',
                    controller: 'PlaylistCtrl'
                }
            },
            resolve: {
                item: function ($stateParams, DataService) {
                    var id = $stateParams.playlistId;
                    return DataService.getItem(id);
                }
            },
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
        .state('exception_page', {
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
    //$urlRouterProvider.otherwise('/app/playlists');
    $urlRouterProvider.otherwise('dbtest');
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