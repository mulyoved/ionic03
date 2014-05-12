angular.module('Ionic03.AddCtrl', [])

.controller('AddCtrl', function (
        $scope, ConfigService, $ionicNavBarDelegate, $timeout, $log,
        DataService, DataSync, MiscServices, HTMLReformat,
        item) {

    function savePost(text) {
        DataSync.savePost(text);
        $ionicNavBarDelegate.back();
    }

    function cameraPicture(sourceType) {
        $log.log('takePicture mode:', sourceType);

        //Camera.PictureSourceType.CAMERA
        MiscServices.cameraPicture(sourceType).
            then(function (imageURI) {
                if (imageURI) {
                    $log.log('Got image URI', imageURI);
                    var text = MiscServices.formatImageUrl(imageURI);
                    //$scope.upload_answer = text;
                    savePost(text);
                }
            }, function (err) {
                $log.error('cameraPicture', err);
                $scope.upload_answer = err;
            });
    }

    $scope.title = ConfigService.blogName;
    $scope.item = item;

    $scope.save = function () {
        console.log('Going to save: ', $scope.item);

        savePost(item.text);
        item.text = '';
    };

    $scope.cancel = function () {
        console.log('Cancel');
        $ionicNavBarDelegate.back();
    };

    $scope.takePicture = function () {
        var sourceType = 0;
        if (typeof Camera != 'undefined') {
            sourceType = Camera.PictureSourceType.CAMERA;
        }
        cameraPicture(sourceType);
    };

    $scope.pickImage = function () {
        var sourceType = 0;
        if (typeof Camera != 'undefined') {
            sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        }
        cameraPicture(sourceType);
    };

    //not sure why, seem like bug in chrom, textinput is not working correctly
    //force some resize fix the problem
    $timeout(function() {
        $scope.applyClass = true;
    }, 20);
});

