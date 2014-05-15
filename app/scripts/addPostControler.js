angular.module('Ionic03.AddCtrl', [])

.controller('AddCtrl', function (
        $scope, ConfigService, $ionicNavBarDelegate, $timeout, $log,
        DataService, DataSync, MiscServices, HTMLReformat,
        item) {

    $scope.title = ConfigService.blogName;
    $scope.item = item;

    function savePost(text) {
        if (text) {
            DataSync.savePost(text)
                .then(function(answer) {
                    $ionicNavBarDelegate.back();
                })
                .catch(function(err) {
                    throw new Error('Failed to save new post in local database');
                });
        }
    }

    $scope.save = function () {
        console.log('Going to save: ', $scope.item);

        savePost(item.text);
        item.text = '';
    };

    $scope.cancel = function () {
        console.log('Cancel');
        $ionicNavBarDelegate.back();
    };

    //not sure why, seem like bug in chrom, textinput is not working correctly
    //force some resize fix the problem
    $timeout(function() {
        $scope.applyClass = true;
    }, 20);
});

