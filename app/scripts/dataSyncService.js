'use strict';

angular.module('Ionic03.controllers')

.service('DataSync', function($rootScope, $q, $http, localStorageService, GoogleApp, GoogleApi, GAPI) {
    var dataSync = {
        gapiLogin: false,
        needSync: true, // Dirty
        duringSync: false,

        init: function() {
            GoogleApi.getToken({
                client_id: GoogleApp.client_id,
                client_secret: GoogleApp.client_secret
            }).then(function(data) {
                console.log('DataSync: got token', data);
                var token = {
                    access_token: data.access_token,
                    client_id: GoogleApp.client_id,
                    cookie_policy: undefined,
                    expire_in: data.expire_in,
                    expire_at: new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000,
                    token_type: data.token_type
                };
                return GAPI.init_WithToken(token);
            }).then(function(data) {
                dataSync.gapiLogin = true;
                console.log('DataSync: gapiLogin = true', data);
                $rootScope.$broadcast('event:DataSync:StatusChange', dataSync);
            }, function(err) {
                dataSync.gapiLogin = false;
                console.log('DataSync: gapiLogin = false');
                $rootScope.$broadcast('event:DataSync:StatusChange', dataSync);
            });
        },

        startSync: function() {
            console.log('Start Sync');

            $rootScope.$broadcast('event:DataSync:StatusChange');
        }
    };


    return dataSync;
});
