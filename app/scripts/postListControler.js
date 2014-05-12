angular.module('Ionic03.PostListCtrl', [])

.controller('PostListCtrl', function (
        $rootScope, $scope, $state, $log, ConfigService,
        $ionicNavBarDelegate, $ionicViewService, $ionicScrollDelegate, DataSync, DataService, HTMLReformat,
        items) {

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

        $log.log('Updated icon ', $scope.syncIcon);
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
    $ionicViewService.clearHistory();
    $scope.syncIcon = "ok";

    var loadItems = function(isLoadMore, lastItem) {
        var scrollPos = $ionicScrollDelegate.getScrollPosition();
        var limit = 10;
        if (!lastItem && scrollPos && scrollPos.top > 0) {
            limit = $scope.items.length;
        }
        $log.log('loadItems', lastItem, $scope.items, limit);

        //Todo: back scroll to the middle?
        var p = DataService.getItems(limit, lastItem);
        p.then(function (answer) {
            $log.log('PostListCtrl: DataService.getItems: Set PlayList !', answer);

            if (lastItem) {
                angular.forEach(answer.rows, function(item) {
                    $scope.items.push(item);
                });
            }
            else {
                $scope.items = answer.rows;
            }

            if (isLoadMore) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }, function (err) {
            if (isLoadMore) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

            $log.error('DataService.getItems Failed ', err);
        });
    };

    $scope.loadMore = function() {
        if ($scope.items.length>0) {
            loadItems(true, $scope.items[$scope.items.length - 1].doc);
        }
        else {
            loadItems(true);
        }

    };


    $scope.$on("event:DataSync:StatusChange", function (event) {
        $log.log('PostListCtrl: Recived: event:DataSync:StatusChange');
        updateIcon();
    });

    $scope.$on("event:DataSync:DataChange", function (event) {
        $log.log('PostListCtrl: Recived: event:DataSync:DataChange');
        loadItems(false); // load only as needed items in case of update
    });

    $scope.doRefresh = function() {
        console.log('Refreshing!');
        startRefresh = true;
        DataSync.sync();
    };

    $scope.show = function(item) {
        var results = HTMLReformat.reformat(item.doc.content);
        //$log.log(item);
        return results;
    };

    $scope.needToSync = function(item) {
        return item.doc.key === 'U';
    };

    $scope.noMoreItemsAvailable = false;
    $scope.items = items.rows;
    updateIcon();
    loadItems(false);

});
