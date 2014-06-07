angular.module('Ionic03.testCtrl2', [])

.controller('testCtrl2', function(
    $scope, $state, ConfigService, $log, $q, $http, $stateParams, $compile,
    GAPI, Blogger, pouchdb, GoogleApi, GoogleApp, DataSync, localStorageService,
    DataService, HTMLReformat, MiscServices, BlogListSync, RetrieveItemsService,
    PushServices
    )
{
    $scope.$on('event:url-click', function(event, url) {
        $log.log('htmlClick', url);
    });

    $scope.html_text = 'v3Text <a href="https://www.google.com/?gws_rd=ssl">Google</a>';
    $scope.html_text2 = 'Just text https://www.google.com/?gws_rd=ssl';
    $scope.html_text3 = 'Seet Final www.fin-alg.com';
    $scope.html_result = '.';

    $scope.htmlClick = function(url) {
        $log.log('htmlClick', url);
    };

    $scope.htmlParserTest = function(text) {
        results = HTMLReformat.reformat(text, true);
        $log.log('Result');
        $scope.html_result = results;
    };

    $scope.go = function(state) {
        $state.go(state);
    };

});