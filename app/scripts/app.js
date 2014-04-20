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
    'directive.g+signin',
])



.run(function($ionicPlatform, $state, $rootScope, ConfigService) {
    $ionicPlatform.ready(function() {
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $rootScope.$on('event:google-plus-signin-success', function (event, authResult) {
        // Send login to server or save into cookie
        console.log('event:google-plus-signin-success event:', event, 'authResult: ', authResult);
        ConfigService.login = true;
        ConfigService.authResult = authResult;
        $state.go('app.playlists');
    });

    $rootScope.$on('event:google-plus-signin-failure', function (event, authResult) {
        // Auth failure or signout detected
        console.log('event:google-plus-signin-failure event:', event, 'authResult: ', authResult);
        ConfigService.login = false;
        ConfigService.authResult = authResult;
        $state.go('login');
    });

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        console.log("$stateChangeStart", event, toState, toParams, fromState, fromParams);
        console.log("toState.authenticate",toState);

        if (!ConfigService.login) {
            if (toState.authenticate) {
                console.log("Redirect to login");
                $state.transitionTo("login");
                event.preventDefault();
            }
        }
        else if (toState.name == 'login') {
            $state.transitionTo("app.playlists");
            event.preventDefault();
        }

    });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('login', {
          url: '/app',
          abstract: false,
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl',
          authenticate: false
      })
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl',
      authenticate: true
    })

    .state('app.search', {
      url: '/search',
      views: {
        'menuContent' :{
          templateUrl: 'templates/search.html'
        }
      },
      authenticate: true
    })

    .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent' :{
          templateUrl: 'templates/browse.html'
        }
      },
      authenticate: true
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent' :{
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      },
      resolve: {
          items: function(DataService) {
              return DataService.getItems();
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
              'menuContent' :{
                  templateUrl: 'templates/add.html',
                  controller: 'AddCtrl'
              }
          },
          resolve: {
              item: function(DataService) {
                  return DataService.getCurrentNewItem();
              }
          },
          authenticate: true
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});

