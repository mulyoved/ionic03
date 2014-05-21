'use strict';

/* jasmine specs for services go here */

describe('DataSync', function() {
    beforeEach(module('Ionic03Mock'));
    beforeEach(function() {
        inject(function(DataService, util, GoogleApi) {
            //DataSync.init();
            GoogleApi.clearToken();
            GoogleApi.setToken({
                access_token: 'ya29.1.AADtN_Wp0Mc3ylhIM6xMIbAuUtGKKbxRlMTLro4ss-Kxnaf2zHJbOCffDq168Q88pO0dYg',
                refresh_token: '1/mz4Y6DPuY7L2Qtk2zgPjOEMGobXBOTqbndFqprd1pSw',
                expires_at: 3600
            });
            DataService.selectBlog({ id: '4462544572529633201', name: 'Unknown'});
            util.flush();
        });
    });

    describe.only('DataSync Injection', function() {
        it('Check Inject', inject(function(DataSync) {
            expect(DataSync).not.to.equal(null);
        }));

        it('Check methods', inject(function(DataSync) {
            expect(typeof DataSync.init).to.equal('function');
            expect(typeof DataSync.sync).to.equal('function');
            expect(typeof DataSync.savePost).to.equal('function');
            expect(typeof DataSync.createPost).to.equal('function');
            expect(typeof DataSync.getItems).to.equal('function');
            expect(typeof DataSync.dumpDatabase).to.equal('function');
        }));

        it('Login', function(done) {
            inject(function (util, DataSync) {
                console.log('DataSync.init');
                util.checkQ(DataSync.init(), done, function(answer) {
                    console.log('checkQ Return DataSync.init', answer);
                });
            });
        });


    });
});
