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

.controller('dbTestCtrl', function($scope, ConfigService, $log, $q, GAPI, Blogger, pouchdb, GoogleApi, DataSync, DataService, blogdb) {
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
        $log.log(item);
        return item.content;
    }

});

