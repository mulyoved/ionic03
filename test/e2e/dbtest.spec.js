describe("dbTest", function () {
    require('jasmine-expect');

    var skipSync = false;

    describe("Database Operations", function () {
        var dbTestPage = require("./pages/dbtestPage");
        var dbTest = new dbTestPage();
        var recordCount = -1;
        var topRecord = null;
        var postText;

        var deleteDB = function() {
            dbTest.deleteDB();

            return browser.wait(function () {
                return dbTest.dumpAnswer.getText().then(function (text) {
                    return text === 'deleted';
                });
            }, 20000);
        };

        var sync = function() {
            //console.log('Start Sync');
            dbTest.sync();

            return browser.wait(function () {
                return dbTest.dumpAnswer.getText().then(function (text) {
                    return text === 'sync' || text === 'sync error';
                });
            }, 30000);
        };

        var dumpDB = function() {
            return dbTest.dumpDB().then(function() {
                expect(dbTest.dumpAnswer.getText()).toBe('dump');
                dbTest.countAnswer.getText().then(function (count) {
                    recordCount = parseInt(count);
                });
            })
        }.bind(this);

        var dumpTopRecord = function(test) {
            dbTest.click('Dump Top Record');
            return dbTest.dumpAnswer.getText().then(function (answer) {
                //console.log('Dump Top Record: got text', answer);
                topRecord = JSON.parse(answer);
                test();
            });
        }.bind(this);

        /*
        it("should display the correct title", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            browser.get('/#');
            expect(browser.getTitle()).toBe('Ionic03');
        });

        it("should be able to open dbtest", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            dbTest.get();
            expect(browser.getTitle()).toBe('Ionic03');
        });
        */

        it("should be able to login", function() {
            console.log('dbtest start');
            browser.get('/#');

            require("./pages/loginProcess")();
        });

        it("should be in main page", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
        });

        it("should dump db", function () {
            element(by.id('menu-toggle')).click();
            element(by.id('setup')).click();
            expect($('h1').getText()).toBe('Setup');
            expect(browser.getCurrentUrl()).toContain('#/app/setup');
            element(by.id('self-test')).click();
            expect(browser.getCurrentUrl()).toContain('#/dbtest');

            dumpDB().then(function() {
                console.log('Record in DB before test: ', recordCount);
            });
        });

        it("should delete db", function () {
            deleteDB().then(function() {
                expect(dbTest.dumpAnswer.getText()).toBe('deleted');
            });
        });

        it("should dump db, after delete", function () {
            dumpDB().then(function() {
                expect(recordCount).toBe(0);
            });
        });

        if (!skipSync) {
            it("should have something after sync", function () {
                sync().then(function() {
                });
            });

            it("Dump after sync", function() {
                dumpDB().then(function() {
                    expect(recordCount).toBeGreaterThan(100);
                    expect(recordCount).toBeLessThan(110);
                });
            });

            it("dump top record before post", function() {
                dumpTopRecord(function() {
                    expect(topRecord._id).toContain('P');
                    expect(topRecord._id).toContain('#'+topRecord.key);
                });
            });

            it("should create new post", function () {
                postText = 'dbtest: ' + new Date().toString();
                dbTest.setPostText(postText);
                dbTest.click('Create New Post').then(function() {
                    var prevCount = recordCount;
                    dumpDB().then(function() {
                        expect(recordCount).toBe(prevCount + 1);
                    });
                });
            });

            it("dump top record", function() {
                dumpTopRecord(function() {
                    expect(topRecord.id).toContain('G');
                    expect(topRecord.key).toBe('U');
                    expect(topRecord.content).toBe(postText);
                });
            });


            it("should sync new post", function() {
                sync().then(function () {
                    expect(dbTest.dumpAnswer.getText()).toBe('sync');
                    dumpDB();
                });
            });

            it("dump top record after add post", function() {
                dumpTopRecord(function() {
                    expect(topRecord._id).toContain('P');
                    expect(topRecord._id).toContain('#'+topRecord.key);
                    expect(topRecord.key).not.toBe('P');
                    expect(topRecord.key).toBe(topRecord.id);
                    expect(topRecord.content).toBe(postText);
                });
            });

            it("should full sync new post", function() {
                deleteDB().then(function () {
                    expect(dbTest.dumpAnswer.getText()).toBe('deleted');

                    dumpDB().then(function () {
                        expect(recordCount).toBe(0);
                    });
                });
            });

            it("should sync after post", function() {
                sync().then(function () {
                    expect(dbTest.dumpAnswer.getText()).toBe('sync');

                    dumpDB().then(function () {
                        expect(recordCount).toBeGreaterThan(100);
                        expect(recordCount).toBeLessThan(110);
                    });
                });
            });

            it("dump top record after post & sync", function() {
                dumpTopRecord(function() {
                    expect(topRecord._id).toContain('P');
                    expect(topRecord._id).toContain('#'+topRecord.key);
                    expect(topRecord.key).not.toBe('P');
                    expect(topRecord.key).toBe(topRecord.id);
                    expect(topRecord.content).toBe(postText);
                });
            });
        }
    });
});