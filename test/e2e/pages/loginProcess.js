var LoginProcess = function() {
    this.dbg = false;

    this.handleAuth = function() {
        return browser.getAllWindowHandles().then(function (handles) {
            // switch to the popup
            if (this.dbg) console.log('handleAuth: handles:', handles);

            if (handles.length>1) {
                var popUpHandle = handles[1];
                var parentHandle = handles[0];

                if (this.dbg) console.log('handleAuth: browser.switchTo popup');
                browser.switchTo().window(popUpHandle);


                browser.driver.getCurrentUrl().then(
                    function (url) {
                        if (this.dbg) console.log('handleAuth: Popup URL', url);

                        var submit = browser.driver.findElement(by.id('submit_approve_access'));
                        submit.click();

                        browser.driver.sleep(8000);
                    });
            }
            else {
                if (this.dbg) console.log('handleAuth: Has only one window');
                browser.switchTo().window(handles[0]);
            }
        });
    };

    var waitForLoginPage = function() {
        //browser.get('/#/login');
        return browser.getCurrentUrl().then(function (url) {
            if (url.indexOf('/#/login') > -1) {
                var loginButton = element(by.css('.google-sign-button'));
                loginButton.click();

                return browser.wait(function () {
                    return browser.getAllWindowHandles().then(function (handles) {
                        if (handles.length > 1) {
                            return true;
                        }
                        else {
                            return browser.getCurrentUrl().then(function (url) {
                                if (url.indexOf('/#/login') > -1) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            });
                        }
                    });
                }, 20000);
            }
            else {
                if (this.dbg) console.log('Login page skiped, already in', url);
                return true;
            }
        });
    };

    var unlock = function() {
        var deferred = protractor.promise.defer();
        element(by.id('0')).getText()
            .then(function(text) {
                if (text !== 'Choose Unlock Code') {
                    deferred.reject('expected to be Choose Unlock Code', text);
                    return;
                }
                element(by.id('patternlockbutton1')).click();
                element(by.id('patternlockbutton5')).click();
                element(by.id('patternlockbutton9')).click();
                element(by.id('patternlockbutton8')).click();

                return element(by.id('0')).getText();
            })
            .then(function(text) {
                if (text !== 'Confirm Unlock Code') {
                    deferred.reject('expected to be Confirm Unlock Code', text);
                    return;
                }
                element(by.id('patternlockbutton1')).click();
                element(by.id('patternlockbutton5')).click();
                element(by.id('patternlockbutton9')).click();
                element(by.id('patternlockbutton8')).click();

                deferred.fulfill('Unloked');
            });

        deferred.fulfill('LoginProcess: Success, Already Done');
        return deferred.promise;
    };

    this.login = function() {
        if (this.dbg) console.log('Start Login:');
        var deferred = protractor.promise.defer();
        var that = this;

        browser.driver.getCurrentUrl()
            .then(function(url) {
                if (url.indexOf('unlock2')>-1) {
                    return unlock();
                }
                else {
                    if (that.dbg) console.log('already unlocked and login, move forward');
                    deferred.fulfill('LoginProcess: Success, Already Done');
                }
            })
            .then(function() {
                return waitForLoginPage().then(function () {
                    browser.getAllWindowHandles().then(function (handles) {
                        if (that.dbg) console.log('handles:', handles);

                        if (handles.length > 1) {
                            var popUpHandle = handles[1];
                            var parentHandle = handles[0];

                            if (that.dbg) console.log('browser.switchTo popup');
                            browser.switchTo().window(popUpHandle);

                            browser.driver.getCurrentUrl().then(
                                function (url) {
                                    if (that.dbg) console.log('Popup URL', url);
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
                                    if (that.dbg) console.log('LoginProcess: Fill login page fields');
                                    var params = browser.params;
                                    email.sendKeys(params.login.user);
                                    password.sendKeys(params.login.password);
                                    signin.click();
                                    browser.driver.sleep(1500);
                                    if (that.dbg) console.log('LoginProcess: End waited to login screen');

                                    that.handleAuth()
                                        .then(function (answer) {
                                            //console.log('Done', answer);
                                            deferred.fulfill('LoginProcess: Success, Done');
                                        })
                                        .thenCatch(function (err) {
                                            console.log('Err', err);
                                            deferred.reject('LoginProcess: Login error');
                                        })
                                        .thenFinally(function (done) {
                                            browser.switchTo().window(parentHandle);
                                            //console.log('LoginProcess: Finally', done);
                                        });
                                });
                        }
                        else {
                            if (that.dbg) console.log('Login Has only one window');
                            browser.switchTo().window(handles[0]);
                            deferred.fulfill('LoginProcess: Success, Already Done');
                        }
                    });
                });
            });

        return deferred.promise;
    }
};

module.exports = LoginProcess;