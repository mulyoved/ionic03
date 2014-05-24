describe("browse screens", function () {
    describe("Main Screen", function () {
        var postText;
        require('jasmine-expect');


        xit("Start", function () {
            driver.context("WEBVIEW", function(err) {
                if (err) {
                    console.error('window switch', err);
                }
                else {
                    console.error('window switch OK');
                }
            });

            /*
            browser.window('WEBVIEW', function(err) {
                if (err) {
                    console.error('window switch', err);
                }
                else {
                    console.error('window switch OK');
                }
            });
            */
        });

        it("should display the correct title", function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            console.log('browse start');
            browser.get('/#');
            browser.sleep(500);

            expect(browser.getCurrentUrl()).toContain('#/unlock2');
            expect(browser.getTitle()).toBe('Ionic03');
            //browser.debugger();
        });

        it("should be able to login", function() {
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

        it("should add post", function() {
            element(by.id('add-post')).click();

            expect(browser.getCurrentUrl()).toContain('#/app/add');
            expect($('h1').getText()).toBe('TestBlog');

            postText = 'browse test post: ' + new Date().toString();
            element(by.id('addpost')).sendKeys(postText);
            element(by.id('save')).click();
        });

        it("should be back in main page", function() {
            expect(browser.getCurrentUrl()).toContain('#/app/playlists');
            expect($('h1').getText()).toBe('TestBlog');

            //Finish sync
            browser.wait(function () {
                return element(by.id('sync-icon')).getAttribute('class').then(function(element_class) {
                    console.log('element_class', element_class);
                    return element_class === 'icon ion-alert ion-ios7-star-outline'
                });
            }, 20000);
        });

        it("check items", function() {
            var list = element.all(by.repeater('item in items'));
            expect(list.count()).toBeGreaterThan(9);
            expect(list.get(0).getText()).toStartWith(postText);
        });
    });
});