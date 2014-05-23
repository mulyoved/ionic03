describe("login process", function () {
    describe("login", function () {
        var postText;
        require('jasmine-expect');

        var skipSplashScreen = function() {
            return browser.wait(function () {
                return browser.getCurrentUrl().then(function(url) {
                    return url.indexOf('splash') < 0;
                });
            }, 20000);
        };

        it("should open unlock screen", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            browser.get('/#');

            skipSplashScreen().then(function() {
                browser.getCurrentUrl().then(function (url) {
                    console.log('URL', url);
                });
                expect(browser.getCurrentUrl()).toContain('#/unlock2');
                expect(browser.getTitle()).toBe('Ionic03');
            });
        });

        it("should be able to choose unlock key", function() {
            expect(element(by.id('0')).getText()).toBe('Choose Unlock Code');
            element(by.id('patternlockbutton1')).click();
            element(by.id('patternlockbutton5')).click();
            element(by.id('patternlockbutton9')).click();
            element(by.id('patternlockbutton8')).click();
        });

        it("should confirm unlock key", function() {
            expect(browser.getCurrentUrl()).toContain('#/unlock2');
            expect(element(by.id('0')).getText()).toBe('Confirm Unlock Code');
            element(by.id('patternlockbutton1')).click();
            element(by.id('patternlockbutton5')).click();
            element(by.id('patternlockbutton9')).click();
            element(by.id('patternlockbutton8')).click();
        });

        it("should be able to login", function() {
            var loginProcess = require("./pages/loginProcess");
            expect(browser.getCurrentUrl()).toContain('#/login');
            var login = new loginProcess();
            if (login.dbg) console.log("Login1");

            login.login()
                .then(function (answer) {
                    expect(answer).toContain('Success');
                    if (login.dbg) console.log('Login Process answer', answer);
                    //done();
                })
                .thenCatch(function (err) {
                    expect(true).toBe(err);
                    if (login.dbg) console.log('Login Process Err', err);
                    //done(err);
                });
        });

        it("should select blog", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/bloglist');
            expect($('h1').getText()).toBe('Select Blog');

            var list = element.all(by.repeater('item in items'));
            expect(list.count()).toBe(2);
            expect(list.get(1).getText()).toBe('Test Blog #2');
            expect(list.get(0).getText()).toBe('TestBlog');
            list.get(0).click();
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
    });
});