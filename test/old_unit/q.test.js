'use strict';

/* jasmine specs for services go here */

describe('service', function() {
    beforeEach(module('Ionic03'));
    beforeEach(module('stateMock'));
    beforeEach(function() {
        inject(function($log, ConfigService) {
            $log.log = console.log;
            //$urlRouterProvider.otherwise('');
        });
    });


    describe('q Test', function() {
        it('q Test', function(done) {
            inject(function($log, $q, DataService, $rootScope) {

                $rootScope.$digest();

                console.log('q Test Start v3');
                $log.log('Log from $log');
                var deferred = $q.defer();

                setTimeout(function () {

                    expect(DataService).not.to.equal(null);
                    assert.typeOf(DataService.getItems, 'function', 'getItems is a function')

                    console.log('q Test After 1000 ms');
                    expect(1).not.to.equal(3);
                    done();
                }, 1000);

                $rootScope.$digest();

                return deferred;
            });
        })
    });

});
