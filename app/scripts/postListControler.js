angular.module('Ionic03.controllers')

.controller('PostListCtrl', function (
        $rootScope, $scope, $state, $log, ConfigService,
        $ionicNavBarDelegate, $ionicViewService, DataSync, DataService, HTMLReformat,
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

    $scope.title = ConfigService.blogName();
    $ionicNavBarDelegate.showBackButton(false);
    $ionicViewService.clearHistory();
    $scope.syncIcon = "ok";

    var updateItemList = function() {
        var p = DataService.getItems();
        p.then(function (answer) {
            $scope.items = answer;
            $log.log('PostListCtrl: DataService.getItems: Set PlayList !', answer);
        }, function (err) {
            $log.error('DataService.getItems Failed ', err);
        });
    };

    $scope.$on("event:DataSync:StatusChange", function (event) {
        $log.log('PostListCtrl: Recived: event:DataSync:StatusChange');
        updateIcon();
    });

    $scope.$on("event:DataSync:DataChange", function (event) {
        $log.log('PostListCtrl: Recived: event:DataSync:DataChange');
        updateItemList();
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

    $scope.items = items;
    updateIcon();
    updateItemList();

});
