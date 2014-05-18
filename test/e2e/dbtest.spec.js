describe("dbTest", function () {

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.slice(0, str.length) == str;
        };
    }


    var skipLogin = false;
    var skipSync = false;

        /*
        afterEach(function() {
            browser.manage().logs().get('browser').then(function(browserLog) {
                //expect(browserLog.length).toEqual(0);
                // Uncomment to actually see the log.
                //console.log('log: ' + require('util').inspect(browserLog));
            });
        });
        */

    describe("Database Operations", function () {
        var dbTestPage = require("./pages/dbtestPage");
        var dbTest = new dbTestPage();
        var recordCount = -1;
        var topRecord = null;

        var deleteDB = function() {
            dbTest.deleteDB();

            return browser.wait(function () {
                return dbTest.dumpAnswer.getText().then(function (text) {
                    return text === 'deleted';
                });
            }, 20000);
        };

        var sync = function() {
            console.log('Start Sync');
            dbTest.sync();

            return browser.wait(function () {
                return dbTest.dumpAnswer.getText().then(function (text) {
                    return text === 'sync';
                });
            }, 20000);
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

        if (!skipLogin) {
            it("should be able to login", function() {
                var loginProcess = require("./pages/loginProcess");
                var login = new loginProcess();

                login.login()
                    .then(function (answer) {
                        expect(answer).toBe('LoginProcess: Login Done');
                        console.log('Login Process answer', answer);
                        //done();
                    })
                    .thenCatch(function (err) {
                        expect(true).toBe(err);
                        console.log('Login Process Err', err);
                        //done(err);
                    });
            });

            it("should select blog", function() {
                expect(browser.getCurrentUrl()).toContain('#/app/bloglist');

                var list = element.all(by.repeater('item in items'));
                expect(list.count()).toBe(2);
                expect(list.get(1).getText()).toBe('Test Blog #2');
                expect(list.get(0).getText()).toBe('TestBlog');
                list.get(0).click();

                /*
                list.count().then(function(count) {
                    console.log('Count', count);
                    for (i=0; i<count; i++) {
                        list.get(i).getText().then(function (text) {
                            console.log('Item Text', text);
                            if (text === 'TestBlog') {
                                list.get(idx).click();
                            }
                        });

                        expect(list.count()).toBe(2);
                        expect(list.get(0).getText()).toBe('Test Blog #2');
                        expect(list.get(1).getText()).toBe('TestBlog');
                        list.get(1).click();
                    }
                })
                */
            });
        }

        it("should dump db", function () {
            console.log('Start Dump DB');
            dbTest.get();

            dumpDB().then(function() {
                console.log('Record in DB before test: ', recordCount);
            });
        });


        it("should delete db", function () {
            dbTest.get();
            deleteDB().then(function() {
                expect(dbTest.dumpAnswer.getText()).toBe('deleted');
            });
        });

        it("should dump db", function () {
            dumpDB().then(function() {
                expect(recordCount).toBe(0);
            });
        });

        if (!skipSync) {
            it("should have something after sync", function () {
                sync();
            });

            it("Dump after sync", function() {
                console.log('End Sync?');
                dumpDB().then(function() {
                    console.log('End Sync - After Dump DB');
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

            var postText;
            it("should create new post", function () {
                console.log('Next test after Sync');
                postText = 'Protector Post: ' + new Date().toString();
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