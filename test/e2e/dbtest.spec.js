describe("hello-protractor", function () {
    describe("index", function () {
        it("should display the correct title", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            browser.get('/#');
            expect(browser.getTitle()).toBe('Ionic03');
        });

        var dbTestPage = require("./pages/dbtestPage");
        var dbTest = new dbTestPage();
        it("should be able to open dbtest", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            dbTest.get();
            expect(browser.getTitle()).toBe('Ionic03');
        });

        it("should delete db", function () {
            dbTest.deleteDB();
            expect(dbTest.dumpAnswer.getText()).toBe('deleted');
        });

        it("should dump db", function () {
            dbTest.dumpDB();
            expect(dbTest.dumpAnswer.getText()).toBe('dump');
            expect(dbTest.countAnswer.getText()).toBe('0');
        });

        it("should have something after sync", function () {
            dbTest.sync();
            expect(dbTest.dumpAnswer.getText()).toBe('sync');

            dbTest.dumpDB();
            expect(dbTest.dumpAnswer.getText()).toBe('dump');
            expect(dbTest.countAnswer.getText()).toBe('10');
        });
    });
});