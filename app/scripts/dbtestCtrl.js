//service - syncronize database with blogger api
//expose status - broadcast change in status
//queue sync request
// - var needSync
// - var duringSync
// - loop when finish sync
// - success and needSync - do sync
// - failed, turn on needSync and try again after some time out
// -





angular.module('Ionic03.controllers')

.controller('dbTestCtrl', function($scope, ConfigService, $log, $q, GAPI, Blogger, pouchdb, GoogleApi, DataSync, DataService, blogdb, HTMLReformat) {
    $scope.answer = '<empty>';
    $scope.blogdb = blogdb;

    $scope.sync = function() {
        $log.log('sync');

        DataSync.sync();
    };

    $scope.createPost = function() {
        $log.log('Add dummy post');
        var time = new Date();

        DataSync.createPost('V2: ' + time.toString(), 'Sample Content' + time.toString());
    };

    //---------------------
    $scope.dumpDatabase = function() {
        DataSync.dumpDatabase();
    };

    $scope.deletedb = function() {
        DataSync.deletedb();
    };

    $scope.getPosts = function() {
        var p = DataService.getItems();
        p.then(function(answer) {
            $log.log(answer);
        }, function(err) {
            $log.error(err);
        });
    };

    $scope.show = function(item) {
        //$log.log(item);
        return item.content;
    };

    //-------------------------------------------------------------------
    $scope.htmlParserTest = function() {
        $log.log('htmlParserTest');

        var results = "";

        var input = '    Picture Post Below<br />\
            <br />\
            <div class="separator" style="clear: both; text-align: center;">\
                <a href="http://3.bp.blogspot.com/-bxdOien00ss/U140FvA8rvI/AAAAAAAAKAQ/h1eswgudS6Q/s1600/4-27-2014+10-42-53+PM.png" imageanchor="1" style="margin-left: 1em; margin-right: 1em;"><img border="0" src="http://3.bp.blogspot.com/-bxdOien00ss/U140FvA8rvI/AAAAAAAAKAQ/h1eswgudS6Q/s1600/4-27-2014+10-42-53+PM.png" height="245" width="320" /></a></div>\
            <br />\
            <br />\
        Picture Post Above\
        ';

        $scope.input = input;
        results = HTMLReformat.reformat(input);
        $log.log('Result', results);

        $scope.results = results;

    }



});

