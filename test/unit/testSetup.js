'use strict';

describe('Test Setup', function () {
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
});
