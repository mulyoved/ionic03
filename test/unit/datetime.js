'use strict';

describe('DateTime', function () {
    beforeEach(module('Ionic03Mock'));

    var PostListCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, ConfigService) {
        scope = $rootScope.$new();
        PostListCtrl = $controller('PostListCtrl', {
            $scope: scope
        });
    }));

    it('should have show_dateTime function', function () {
        expect(typeof scope.show_dateTime).toBe('function');
    });

    it('format time', function() {
        var pastDate = new Date('2014-05-19T08:24:03-07:00');
        var hourAgoDate = new Date(new Date() - 3600 * 1000);
        var month = new Date(pastDate - 60 * 24 * 3600 * 1000);
        var hour1 = new Date(new Date().setHours(13,5,23));
        var hour2 = new Date(new Date().setHours(12,5,23));
        var hour3 = new Date(new Date().setHours(8,5,23));

        expect(scope.show_dateTime({updated: '2014-05-19T08:24:03-07:00'})).toBe('May 19');
        expect(scope.show_dateTime({updated: hourAgoDate.toString()})).toBe(hourAgoDate.getHours()+':'+hourAgoDate.getMinutes());
        expect(scope.show_dateTime({updated: month.toString()})).toBe('Mar 20');
        expect(scope.show_dateTime({updated: hour1.toString()})).toBe('13:05');
        expect(scope.show_dateTime({updated: hour2.toString()})).toBe('12:05');
        expect(scope.show_dateTime({updated: hour3.toString()})).toBe('8:05');
    });


    it('bump date', function() {
        var now = new Date();
        var bumpDate = new Date(now.getTime() + 1);



        console.log(now, bumpDate);
        expect(scope.show_dateTime({updated: now})).toBe(scope.show_dateTime({updated: bumpDate}));
    });

    it('zero date', function() {
        expect(scope.show_dateTime({updated: new Date(0).toString()})).toBe('Jan 1');
    });

});
