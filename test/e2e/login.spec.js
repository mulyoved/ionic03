describe("login process", function () {
    describe("login", function () {
        var postText;
        require('jasmine-expect');

        it("should be able to login", function() {
            browser.get('/#');
            require("./pages/loginProcess")();
        });

        it("should be in main page", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
            expect($('h1').getText()).toBe('TestBlog');

            //Finish sync
            browser.wait(function () {
                return element(by.id('sync-icon')).getAttribute('class').then(function(element_class) {
                    return element_class === 'icon ion-alert ion-ios7-star-outline'
                });
            }, 20000);
        });

        it("should open setup menu", function() {
            element(by.id('menu-toggle')).click();
            element(by.id('setup')).click();
            expect($('h1').getText()).toBe('Setup');
            expect(browser.getCurrentUrl()).toContain('#/app/setup');
            element(by.id('self-test')).click();
            expect(browser.getCurrentUrl()).toContain('#/dbtest');
        });

        it("should be able to login again - 2nd Login", function () {
            browser.get('/#');
            require("./pages/loginProcess")();
        });

        it("should be in main page - 2nd Login", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
        });
    });
});