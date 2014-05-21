angular.module('Ionic03.PostListCtrl', [])

.controller('PostListCtrl', function (
        $rootScope, $scope, $state, $log, ConfigService,
        $ionicNavBarDelegate, $ionicViewService, $ionicScrollDelegate, DataSync, DataService, HTMLReformat,
        RetrieveItemsService, MiscServices
        /*items*/) {

    var iconError = 'icon ion-alert';
    var iconOk = 'ion-ios7-star-outline';
    var iconSync = 'ion-looping';
    var startRefresh = true;

    var updateIcon = function() {
        if (!DataSync.gapiLogin || DataSync.error) {
            $scope.syncIcon = iconError;
        }
        else if (DataSync.duringSync) {
            $scope.syncIcon = iconSync;
        }
        else if (DataSync.needSync) {
            $scope.syncIcon = iconError;
        }
        else {
            $scope.syncIcon = iconOk;
        }

        if (startRefresh && !DataSync.duringSync) {
            $scope.$broadcast('scroll.refreshComplete');
            startRefresh = false;
        }

        //$log.log('Updated icon ', $scope.syncIcon);
    };

    $scope.sync = function() {
        if ($scope.syncIcon === iconError) {
            $state.go('app.diagnostic');
        }
        else if (!DataSync.duringSync) {
            DataSync.sync();
        }
    };

    $scope.add = function() {
        $state.go('app.add');
    };

    $scope.title = ConfigService.blogName;
    $ionicNavBarDelegate.showBackButton(false);

    if (!ConfigService.isUnittest) {
        $ionicViewService.clearHistory();
    }

    $scope.syncIcon = "ok";
    var pendingResetRequest = false;

    var loadItems = function(isLoadMore) {

        if (DataSync.newData) {
            isLoadMore = false;
            DataSync.newData = false;
        }

        var scrollPos = $ionicScrollDelegate.getScrollPosition();
        var limit = 10;
        if (!isLoadMore && scrollPos && scrollPos.top > 0) {
            limit = $scope.items.length;
        }
        $log.log('PostListCtrl Going To Request RetrieveItemsService.loadItems - more:', isLoadMore, limit, scrollPos);

        RetrieveItemsService.loadItems(limit, isLoadMore)
            .then(function(answer) {
                $log.log('PostListCtrl:Answer', answer.length, answer, RetrieveItemsService.getStatus());
                //console.table(answer);
                $scope.items = answer;

                //if (isLoadMore) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                //}

                $scope.noMoreItemsAvailable = RetrieveItemsService.getStatus().source === 'end';

                if (pendingResetRequest) {
                    pendingResetRequest = false;
                    loadItems(false);
                }
            })
            .catch(function(err) {
                //if (isLoadMore) {
                //Not accurate but no harm should happen if we call it also when not needed, less fragile then check
                //isLoadMore as some times we fake loade more into reload
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                //}

                $log.error('DataService.getItems Failed ', err);
                if (!isLoadMore) {
                    //Failed, probebly Busy, so mark that need to reset
                    pendingResetRequest = true;
                }
            });
    };

    $scope.loadMore = function() {
        $log.log('PostListCtrl: loadMore');
        loadItems(true);
    };


    $scope.$on("event:DataSync:StatusChange", function (event) {
        $log.log('PostListCtrl: Recived: event:DataSync:StatusChange');
        updateIcon();
    });

    $scope.$on("event:DataSync:Notify", function (event, args) {
        $log.log('PostListCtrl: Recived: event:DataSync:Notify, reload list from start');
        loadItems(false); // load only as needed items in case of update
    });

    $scope.doRefresh = function() {
        console.log('Refreshing!');
        startRefresh = true;
        if (!DataSync.duringSync) {
            DataSync.sync();
        }
    };

    $scope.show = function(item) {
        return HTMLReformat.reformat(item.content);
    };

    $scope.show_dateTime = function(item) {
        return item.updated;
    };

    $scope.needToSync = function(item) {
        return item.key === 'U';
    };

    function savePost(text) {
        if (text) {
            DataSync.savePost(text)
                .then(function(answer) {
                    //do nothing
                })
                .catch(function(err) {
                    throw new Error('Failed to save new post in local database');
                });
        }
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
            });
    }

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



    $scope.noMoreItemsAvailable = false;
    //$scope.items = RetrieveItemsService.getItems();
    updateIcon();
    if (!DataSync.syncEnabled) {
        $log.log('Set DataSync.syncEnabled = true');
        DataSync.syncEnabled = true;

        if (DataSync.needSync) {
            DataSync.sync();
        }
    }
    //loadItems(false);
});
