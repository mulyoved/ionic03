'use strict';



var googleapi = {
    setToken: function(data) {
        //Cache the token
        localStorage.access_token = data.access_token;
        //Cache the refresh token, if there is one
        localStorage.refresh_token = data.refresh_token || localStorage.refresh_token;
        //Figure out when the token will expire by using the current
        //time, plus the valid time (in seconds), minus a 1 minute buffer
        var expiresAt = new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000;
        localStorage.expires_at = expiresAt;
    },
    authorize: function($q, options) {
        var deferred = $q.defer();

        //Build the OAuth consent page URL
        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            scope: options.scope
        });

        console.log('authorize', authUrl);

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
        function googleCallback(e){
            console.log('googleCallback', e);

            var url = (typeof e.url !== 'undefined' ? e.url : e.originalEvent.url);
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                //Always close the browser when match is found
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
                }).finally(function(data) {
                    googleapi.setToken(data);
                    deferred.resolve(data);
                }).catch(function(response) {
                    deferred.reject(response.responseJSON);
                });
            } else if (error) {
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
        }

        return deferred.promise;
    },
    getToken: function($q, options) {
        var deferred = $q.defer();

        if (new Date().getTime() < localStorage.expires_at) {
            deferred.resolve({
                access_token: localStorage.access_token
            });
        } else if (localStorage.refresh_token) {
            $.post('https://accounts.google.com/o/oauth2/token', {
                refresh_token: localStorage.refresh_token,
                client_id: options.client_id,
                client_secret: options.client_secret,
                grant_type: 'refresh_token'
            }).finally(function(data) {
                googleapi.setToken(data);
                deferred.resolve(data);
            }).catch(function(response) {
                deferred.reject(response.responseJSON);
            });
        } else {
            deferred.reject();
        }

        return deferred.promise;
    },
    userInfo: function(options) {
        return $.getJSON('https://www.googleapis.com/oauth2/v1/userinfo', options);
    }
};

angular.module('Ionic03.controllers')

.controller('dbTestCtrl', function($scope, ConfigService, $log, $q, GAPI, Blogger, pouchdb) {
    $scope.blogId = '4462544572529633201';
    $scope.answer = '<empty>';
    $scope.posts = [];

    var prop = {
        client_id: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com',
        client_secret: 'BCOBtps2R5GQHlGKb7mu7nQt',
        redirect_uri: 'http://localhost',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
    };

    $scope.init = function() {
        //Check if we have a valid token
        //cached or if we can get a new
        //one using a refresh token.
        googleapi.getToken($q, {
            client_id: app.client_id,
            client_secret: app.client_secret
        }).finally(function() {
            //Show the greet view if we get a valid token
            $scope.showGreetView();
        }).catch(function() {
            //Show the login view if we have no valid token
            $scope.showLoginView();
        });
    };

    $scope.showLoginView = function() {
        $log.log('Show the login view if we have no valid token');
    };

    $scope.showGreetView = function() {
        $log.log('Show the greet view if we get a valid token');

        //Get the token, either from the cache
        //or by using the refresh token.
        googleapi.getToken($q, {
            client_id: app.client_id,
            client_secret: app.client_secret
        }).then(function(data) {
            //Pass the token to the API call and return a new promise object
            return googleapi.userInfo({ access_token: data.access_token });
        }).finally(function(user) {
            //Display a greeting if the API call was successful
            $log.log('Hello ' + user.name + '!');
        }).catch(function() {
            //If getting the token fails, or the token has been
            //revoked, show the login view.
            $scope.showLoginView();
        });
    };

    $scope.$on('event:google-plus-signin-success', function (event, authResult) {
        console.log('Send login to server or save into cookie');
    });
    $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
        console.log('Auth failure or signout detected');
    });

    $scope.authorize = function () {
        GAPI.init();
    };

    $scope.getBlogByUrl = function() {
        $log.log('getBlogByUrl');

        $scope.answer = Blogger.getBlogByUrl({'url': 'http://mulytestblog.blogspot.co.il/'});
    };

    $scope.getPosts = function() {
        $log.log('getOPosts');

        var p = Blogger.listPosts('4462544572529633201',
            {'fetchBodies': true, 'fetchImages': false, 'maxResults': 10,'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'});

        $log.log('Answer: ', $scope.posts);

        p.
        then(function(list) {
            $log.log('List: ', list);
            $scope.posts = list.items;
        });
    };

    $scope.Google_Sign_Cordova = function() {
        $log.log('Google_Sign_Cordova');

        //Show the consent page
        googleapi.authorize($q, {
            client_id: prop.client_id,
            client_secret: prop.client_secret,
            redirect_uri: prop.redirect_uri,
            scope: prop.scope
        }).finally(function() {
            $log.log('authorize: Finally');
            //Show the greet view if access is granted
            $scope.showGreetView();
        }).catch(function(data) {
            //Show an error message if access was denied
            $log.log('Show an error message if access was denied ', data.error);
        });
    };

        //fetchBodies=true&fetchImages=true&maxResults=10&fields=items(content%2Cid%2Ckind%2Cpublished%2Cstatus%2Ctitle%2CtitleLink%2Cupdated)%2CnextPageToken&key={YOUR_API_KEY}

        //https://www.googleapis.com/blogger/v3/blogs/6225549217598152239/posts?fetchBodies=true&fetchImages=false&             fields=items(content%252Cid%252Ckind%252Cpublished%252Cstatus%252Ctitle%252CtitleLink%252Cupdated)%252CnextPageToken&maxResults=10
        //https://www.googleapis.com/blogger/v3/blogs/6225549217598152239/posts?fetchBodies=true&fetchImages=true&maxResults=10&fields=items(content%2Cid%2Ckind%2Cpublished%2Cstatus%2Ctitle%2CtitleLink%2Cupdated)%2CnextPageToken&key

});

