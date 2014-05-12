'use strict';
// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Ionic03Mock', [
    'ionic',
    'Ionic03.controllers',
    'Ionic03.AddCtrl',
    'Ionic03.BlogListSync',
    'Ionic03.DataSync',
    'Ionic03.dbTestCtrl',
    'Ionic03.GoogleApi',
    'Ionic03.MiscServices',
    'Ionic03.PostListCtrl',
    'Ionic03.UnlockCtrl',
    'Ionic03.services',
    'Ionic03.directives',
    'gapi',
    'pouchdb',
    'LocalStorageModule'
])

.run(function ($ionicPlatform, $state, $rootScope, $urlRouter, $log, $ionicPopup, ConfigService, DataService, DataSync) {
    //temp
    //$log.log = console.log;
})

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
])
.value('GoogleApp', {

    client_id: '44535440585-qt3i43covgvoo0gkh5n4sj5kkqhem91o.apps.googleusercontent.com', //unit test
    client_secret: 'i0hQZ6vTyCwuYV2NqvG3k2rS',
    redirect_uri: 'http://localhost',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/blogger https://picasaweb.google.com/data/',

    //GAPI On Browser
    apiKey: 'AIzaSyD1tYJ1jzmnI85ctEFfLBMnB5zzva5LIDo',
    clientId: '44535440585-qt3i43covgvoo0gkh5n4sj5kkqhem91o.apps.googleusercontent.com', //unit test
    scopes: [
        // whatever scopes you need for your app, for example:
        //'https://www.googleapis.com/auth/drive',
        //'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/blogger'
        //'https://picasaweb.google.com/data/'
    ]

})
.factory('util', function($log, $q, $timeout) {
    return {
        flush: function () {
            setTimeout(function () {
                try {
                    $timeout.flush();
                } catch (e) {
                    //ignore
                }
            }, 100);
        },

        checkQ: function (p, done, cond) {
            p
                .then(function (answer) {
                    cond(answer);
                    //console.log('DataService.getItems Returned', answer);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        }
    }
});

