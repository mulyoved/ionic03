describe("login process", function () {
    describe("login", function () {

        it("#login should be able to login", function() {
            browser.get('/#');

            require("./pages/loginProcess")();
        });

        it("login should be in main page", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
        });

        it("#2 login 2nd time", function() {
            console.log('#2nd login start');
            browser.get('/#');

            require("./pages/loginProcess")();
        });

        it("#2 should be in main page", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
        });


    });
});