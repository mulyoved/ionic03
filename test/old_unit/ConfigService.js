'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('Ionic03.services'));

    describe('ConfigService Injection', function() {
    it('Check Inject', inject(function(ConfigService) {
        //expect(ConfigService).toEqual('0.1');
        //expect(ConfigService).toNotEqual(null);
        expect(ConfigService).not.to.equal(null);
    }));

    it('Check albumId', inject(function(ConfigService) {
      expect(ConfigService.albumId).to.equal('5965097735673433505');
    }));
    });

    describe('ConfigService Injection Test2', function() {
        it('Check Inject2', inject(function(ConfigService) {
            //expect(ConfigService).toEqual('0.1');
            //expect(ConfigService).toNotEqual(null);
            expect(ConfigService).not.to.equal(null);
        }));

        it('Check albumId2', inject(function(ConfigService) {
            expect(ConfigService.albumId).to.equal('5965097735673433505');
        }));
    });

});
