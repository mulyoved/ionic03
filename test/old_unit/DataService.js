'use strict';

describe('DataService', function() {
    beforeEach(module('Ionic03Mock'));

    //beforeEach(module('stateMock'));
    beforeEach(function() {
        inject(function(DataService, util) {
            //DataSync.init();
            DataService.selectBlog({ id: '4462544572529633201', name: 'Unknown'});
        });
    });

    describe('DataSync Injection', function() {
        this.timeout(5000);

        it('Check Inject', inject(function(DataService) {
            expect(DataService).not.to.equal(null);
        }));

        it('Check methods', inject(function(DataService) {
            expect(typeof DataService.getItems).to.equal('function');
            assert.typeOf(DataService.getItems, 'function', 'getItems is a function')
        }));

        it('Delete Database', function(done) {
            inject(function(DataService, util) {
                DataService.deletedb()
                    .then(function(answer) {
                        console.log('DataService.deletedb Returned', answer);
                        util.flush();
                        return DataService.getItems(1);
                    })
                    .then(function(answer) {
                        console.log('DataService.getItems(1)', answer);
                        expect(answer.total_rows).to.equal(0);
                        done();
                    })
                    .catch(function(err) {
                        done(err);
                    });
            })
        });

        it('Add Items', function(done) {
            inject(function(DataService, DataSync, util) {
                DataService.deletedb()
                    .then(function(answer) {//
                        util.flush();
                        return DataSync.createPost('title', 'content');
                    })
                    .then(function(answer) {
                        util.flush();
                        return DataService.getItems(10);
                    })
                    .then(function(answer) {
                        expect(answer.total_rows).to.equal(1);
                        done();
                    })
                    .catch(function(err) {
                        done(err);
                    });
            });
        });

        it.skip('Count Items', function(done) {
            inject(function (DataService, util) {
                console.log('DataService Count Items v3');

                var p = DataService.getItems(10);
                util.checkQ(p, done, function(answer) {
                    //expect(answer).to.haves.property('total_rows');
                    //console.log("Count: ", answer.total_rows);
                });
            })
        });


    });
});
