'use strict';

/* jasmine specs for services go here */

describe('GoogleApi', function() {
    beforeEach(module('Ionic03Mock'));
    beforeEach(function() {
        inject(function(DataService, util, GoogleApi) {
            //DataSync.init();
            GoogleApi.clearToken();
            GoogleApi.setToken({
                    access_token: 'ya29.1.AADtN_X4d1ADh-i8wI74fSEjbsm9PgzUUvRU6_Hjkj9vh3kcc90YUG615OqyheW6SfbmNQ',
                    refresh_token: '1/mz4Y6DPuY7L2Qtk2zgPjOEMGobXBOTqbndFqprd1pSw',
                    expires_at: 3600
                });
            DataService.selectBlog({ id: '4462544572529633201', name: 'Unknown'});
            util.flush();
        });
    });

    describe('GoogleApi Injection', function() {
        this.timeout(5000);
        it('Check Inject', inject(function(GoogleApi) {
            expect(GoogleApi).not.to.equal(null);
        }));

        it('Check methods', inject(function(GoogleApi) {
            expect(typeof GoogleApi.setToken).to.equal('function');
        }));

        /*
        it.only('GoogleApi Login', function(done) {
            this.timeout(30000);
            inject(function (GoogleApi, GAPI) {
                var p = GAPI.init();
                p.then(function (data) {
                    console.log('Authorize: Success', data);
                    done();
                }, function (err) {
                    console.error('Authorize: Failed', err);
                    done(err);
                });

                //return p;
            });
        });
        */

    });
});
