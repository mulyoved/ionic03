'use strict';

angular.module('Ionic03.GoogleApi', [])

.service('GoogleApi', function($rootScope, $q, $http, localStorageService, GoogleApp) {
    var googleapi = {
        setToken: function (data) {
            console.log('GoogleApi: setToken', data);

            //Cache the token
            localStorageService.add('access_token',data.access_token);
            //Cache the refresh token, if there is one
            localStorageService.add('refresh_token', data.refresh_token || localStorageService.get('refresh_token'));
            //Figure out when the token will expire by using the current
            //time, plus the valid time (in seconds), minus a 1 minute buffer
            var expiresAt = new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000;
            localStorageService.add('expires_at', expiresAt);
        },

        clearToken: function () {
            console.log('GoogleApi: clearToken');

            localStorageService.remove('access_token');
            localStorageService.remove('refresh_token');
            localStorageService.remove('expires_at');
        },

        authorize: function (options) {
            var deferred = $q.defer();

            //Build the OAuth consent page URL
            var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
                client_id: options.client_id,
                redirect_uri: options.redirect_uri,
                response_type: 'code',
                scope: options.scope
            });

            console.log('authorize: [' + authUrl + ']');

            //Open the OAuth consent page in the InAppBrowser
            var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

            //The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
            //which sets the authorization code in the browser's title. However, we can't
            //access the title of the InAppBrowser.
            //
            //Instead, we pass a bogus redirect_uri of "http://localhost", which means the
            //authorization code will get set in the url. We can access the url in the
            //loadstart and loadstop events. So if we bind the loadstart event, we can
            //find the authorization code and close the InAppBrowser after the user
            //has granted us access to their data.
            authWindow.addEventListener('loadstart', googleCallback);

            function googleCallback(e) {
                console.log('googleCallback [' + e +']');

                var url = (typeof e.url !== 'undefined' ? e.url : e.originalEvent.url);
                var code = /\?code=(.+)$/.exec(url);
                var error = /\?error=(.+)$/.exec(url);

                console.log('googleCallback url:[' + url +']');
                console.log('googleCallback code:[' + code +']');
                console.log('googleCallback error:[' + error +']');

                if (code || error) {
                    //Always close the browser when match is found
                    console.log('googleCallback Close window');
                    authWindow.close();
                }

                if (code) {
                    //Exchange the authorization code for an access token
                    $.post('https://accounts.google.com/o/oauth2/token', {
                        code: code[1],
                        client_id: options.client_id,
                        client_secret: options.client_secret,
                        redirect_uri: options.redirect_uri,
                        grant_type: 'authorization_code'
                    }).done(function(data) {
                       console.log('googleCallback finally, calling setToken' + data);
                        googleapi.setToken(data);
                        deferred.resolve(data);
                    }).fail(function(response) {
                        console.log('googleCallback catch ' + response);
                        console.log('googleCallback catch JSON:' + response.responseJSON);
                        deferred.reject(response.responseJSON);
                    });
                } else if (error) {
                    console.log('googleCallback error [' + error + ']');
                    //The user denied access to the app
                    deferred.reject({
                        error: error[1]
                    });
                }
            }

            return deferred.promise;
        },

        getToken: function (options) {
            var deferred = $q.defer();

            if (new Date().getTime() < localStorageService.get('expires_at')) {
                console.log('GoogleApi:getToken, Has a valid token in local storage');

                deferred.resolve({
                    access_token: localStorageService.get('access_token')
                });
            } else if (localStorageService.get('refresh_token')) {
                console.log('GoogleApi:getToken, Request to refresh token');
                $.post('https://accounts.google.com/o/oauth2/token', {
                    refresh_token: localStorageService.get('refresh_token'),
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    grant_type: 'refresh_token'
                }).done(function(data) {
                    console.log('GoogleApi:getToken, Got refresh token, save it');
                    googleapi.setToken(data);
                    deferred.resolve(data);
                }).fail(function(response) {
                    console.log('GoogleApi:getToken, Failed to get token: '+response.responseJSON);
                    deferred.reject(response.responseJSON);
                });
            } else {
                //console.log('GoogleApi:getToken, Not found Token in local storage');
                deferred.reject();
            }

            return deferred.promise;
        },

        logout: function() {
            var deferred = $q.defer();

            var token = localStorageService.get('access_token');
            if (token) {
                $.post('https://accounts.google.com/o/oauth2/revoke', {
                    token: token
                })
                    .done(function(data) {
                        console.log('GoogleApi:logout');
                        googleapi.clearToken();
                        deferred.resolve(data);
                    }).fail(function(response) {
                        console.log('GoogleApi:logout Failed (v2): ', response);
                        googleapi.clearToken();
                        //Return wierd errors, and maybe not correct but seem to do the work
                        deferred.resolve();
                        //deferred.reject(response.responseJSON);
                    });
            }
            else {
                deferred.reject('Empty Token');
            }

            return deferred.promise;
        },

        getUserInfo: function() {
            var deferred = $q.defer();

            var token = localStorageService.get('access_token');
            if (token) {
                $.getJSON('https://www.googleapis.com/oauth2/v1/userinfo', { access_token: token })
                .done(function(data) {
                    console.log('GoogleApi:getUserInfo', data);
                    deferred.resolve(data);
                }).fail(function(response) {
                    console.log('GoogleApi:getUserInfo Failed (v2): ', response);
                    deferred.reject(response);
                });
            }
            else {
                deferred.reject('Empty Token');
            }

            return deferred.promise;
        }



    };

    return googleapi;
})
