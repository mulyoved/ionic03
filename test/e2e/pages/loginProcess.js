var LoginProcess = function() {

    this.handleAuth = function() {
        return browser.getAllWindowHandles().then(function (handles) {
            // switch to the popup
            console.log('handleAuth: handles:', handles);

            if (handles.length>1) {
                var popUpHandle = handles[1];
                var parentHandle = handles[0];

                console.log('handleAuth: browser.switchTo popup');
                browser.switchTo().window(popUpHandle);


                browser.driver.getCurrentUrl().then(
                    function (url) {
                        console.log('handleAuth: Popup URL', url);

                        var submit = browser.driver.findElement(by.id('submit_approve_access'));
                        submit.click();

                        browser.driver.sleep(8000);
                    });
            }
            else {
                console.log('handleAuth: Has only one window');
                browser.switchTo().window(handles[0]);
            }
        });
    };

    this.login = function() {
        var deferred = protractor.promise.defer();
        var that = this;

        browser.driver.get('http://localhost:9000/#/login');
        var loginButton = element(by.css('.google-sign-button'));
        loginButton.click();

        browser.driver.sleep(1000);
        browser.getAllWindowHandles().then(function (handles) {

            // switch to the popup
            //console.log('handles:', handles);

            var popUpHandle = handles[1];
            var parentHandle = handles[0];

            //console.log('browser.switchTo popup');
            browser.switchTo().window(popUpHandle);

            browser.driver.getCurrentUrl().then(
                function (url) {
                    //console.log('Popup URL', url);
                    var email = browser.driver.findElement(by.id('Email'));
                    var password = browser.driver.findElement(by.id('Passwd'));
                    var signin = browser.driver.findElement(by.id('signIn'));

                    //
                    //console.log('Email', email);

                    //console.log('Email exists', element(email).isPresent());

                    /*
                     element(by.id('Email')).isPresent().then(function(answer) {
                     console.log('Email exists',answer);
                     });
                     */

                    //browser.driver.sleep(2000);
                    console.log('LoginProcess: Fill login page fields');
                    email.sendKeys('bloggerApplication');
                    password.sendKeys('Giza2000');
                    signin.click();
                    browser.driver.sleep(1500);
                    console.log('LoginProcess: End waited to login screen');

                    that.handleAuth()
                        .then(function(answer) {
                            console.log('Done', answer);
                            deferred.fulfill('LoginProcess: Login Done');
                        })
                        .thenCatch(function(err) {
                            console.log('Err', err);
                            deferred.reject('LoginProcess: Login error');
                        })
                        .thenFinally(function(done) {
                            browser.switchTo().window(parentHandle);
                            console.log('LoginProcess: Finally', done);
                        });
                });
        });

        return deferred.promise;
    }
};

module.exports = LoginProcess;