'use strict';
angular.module('Ionic03.controllers')

.controller('dbTestCtrl', function($scope, ConfigService, $log, $q, GAPI, Blogger, pouchdb) {
    $scope.blogId = '4462544572529633201';

    $scope.$on('event:google-plus-signin-success', function (event, authResult) {
        console.log('Send login to server or save into cookie');
    });
    $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
        console.log('Auth failure or signout detected');
    });

    $scope.authorize = function () {
        GAPI.init();
    };

});
