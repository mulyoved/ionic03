describe("browse screens", function () {
    describe("Main Screen", function () {
        var postText;

        it("should display the correct title", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            browser.get('/#');
            expect(browser.getCurrentUrl()).toContain('#/login');
            expect(browser.getTitle()).toBe('Ionic03');

            browser.debugger();
        });

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

        it("should add post", function() {
            element(by.id('add-post')).click();

            expect(browser.getCurrentUrl()).toContain('#/app/add');
            expect($('h1').getText()).toBe('TestBlog');

            postText = 'Post: ' + new Date().toString();
            element(by.id('addpost')).sendKeys(postText);
            element(by.id('save')).click();
        });

        it("should be back in main page", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
            expect($('h1').getText()).toBe('TestBlog');

            //Finish sync
            browser.wait(function () {
                return element(by.id('sync-icon')).getAttribute('class').then(function(element_class) {
                    return element_class === 'icon ion-alert ion-ios7-star-outline'
                });
            }, 20000);
        });

        it("check items", function() {
            var list = element.all(by.repeater('item in items'));
            expect(list.count()).toBeGreaterThan(9);
            expect(list.get(0).getText()).toBe(postText);
        });
    });
});