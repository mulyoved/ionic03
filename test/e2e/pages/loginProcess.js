var LoginProcess = function() {
    this.dbg = false;

    this.handleAuth = function() {
        var that = this;
        return browser.getAllWindowHandles().then(function (handles) {
            // switch to the popup
            if (that.dbg) console.log('handleAuth: handles:', handles);

            if (handles.length>1) {
                var popUpHandle = handles[1];
                var parentHandle = handles[0];

                if (that.dbg) console.log('handleAuth: browser.switchTo popup');
                browser.switchTo().window(popUpHandle);


                return browser.driver.getCurrentUrl().then(function (url) {
                        if (that.dbg) console.log('handleAuth: Popup URL', url);

                        var submit = browser.driver.findElement(by.id('submit_approve_access'));
                        submit.click();

                        browser.driver.sleep(8000);
                        return 1;
                    });
            }
            else {
                if (that.dbg) console.log('handleAuth: Has only one window');
                browser.switchTo().window(handles[0]);
                return 0;
            }
        });
    };

    this.waitForLoginPage = function() {
        var that = this;
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
                if (that.dbg) console.log('Login page skiped, already in', url);
                return true;
            }
        });
    };

    this.unlock = function() {
        var that = this;
        if (this.dbg) console.log('Unlock: Start');
        var deferred = protractor.promise.defer();
        element(by.id('0')).getText()
            .then(function(text) {
                if (that.dbg) console.log('Unlock screen', text);
                if (text === 'Welcome' || text === 'Choose Unlock Code') {

                    element(by.id('patternlockbutton1')).click();
                    element(by.id('patternlockbutton5')).click();
                    element(by.id('patternlockbutton9')).click();
                    element(by.id('patternlockbutton8')).click();

                    if (text === 'Welcome') {
                        deferred.fulfill('Unlocked');
                    }
                    else {
                        return element(by.id('0')).getText();
                    }
                }
                else {
                    deferred.reject('expected to be Choose Unlock Code', text);
                }
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

        return deferred.promise;
    };

    this.doLogin = function() {
        var deferred = protractor.promise.defer();
        var that = this;
        if (this.dbg) console.log('Login continue');
        this.waitForLoginPage()
            .then(function () {browser.getAllWindowHandles().then(function (handles) {
                if (that.dbg) console.log('handles:', handles);

                if (handles.length > 1) {
                    var popUpHandle = handles[1];
                    var parentHandle = handles[0];

                    if (that.dbg) console.log('browser.switchTo popup');
                    browser.switchTo().window(popUpHandle);

                    browser.driver.getCurrentUrl()
                        .then(function (url) {
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
                                    //deferred.fulfill('LoginProcess: Success, Done');
                                    deferred.fulfill(0);
                                })
                                .thenCatch(function (err) {
                                    console.log('Err', err);
                                    deferred.reject('Login: Error'+err);
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
                    //deferred.fulfill('LoginProcess: Success, Already Done');
                    deferred.fulfill(0);
                }
            });
        });

        return deferred.promise;
    };

    this.startProcess = function() {
        if (this.dbg) console.log('Start Login:');
        var deferred = protractor.promise.defer();
        var that = this;
        browser.sleep(500);

        //Unlock
        //Login
        //Select blog
        //Confirm main page

        browser.driver.getCurrentUrl()
            .then(function(url) {
                //Unlock
                if (that.dbg) console.log('#login, started in URL', url);

                if (url.indexOf('unlock2')>-1) {
                    if (that.dbg) console.log('#login, Call unlock procedure');
                    return that.unlock();
                }
                else {
                    return 0;
                }

            })
            .then(function(answer) {
                return browser.driver.getCurrentUrl();
            })
            .then(function(url) {
                //Login
                if (that.dbg) console.log('#login, step2, (login), url=', url);
                if (url.indexOf('login')>-1) {
                    if (that.dbg) console.log('#login, Call login procedure');
                    return that.doLogin();
                }
                else {
                    return 0;
                }
            })
            .then(function(answer) {
                return browser.driver.getCurrentUrl();
            })
            .then(function(url) {
                //Select Blog
                if (that.dbg) console.log('#login, step3, (select blog ), url=', url);
                if (url.indexOf('#/app/bloglist') > -1) {
                    if (that.dbg) console.log('#login, Call select blog procedure');
                    var list = element.all(by.repeater('item in items'));
                    list.get(0).click();
                }
                else {
                    return 0;
                }
            })
            .then(function(answer) {
                return browser.driver.getCurrentUrl();
            })
            .then(function(url) {
                //Confirm Main Page
                if (that.dbg) console.log('#login, step4, (confirm main page), url=', url);
                if (url.indexOf('#/app/playlists') > -1) {
                    if (that.dbg) console.log('#login, Success');
                    deferred.fulfill('Login: Success');
                }
                else {
                    if (that.dbg) console.log('#login, Error');
                    deferred.reject('Login: Error');
                }
            });

        return deferred.promise;
    };
};

var start = function() {
    var login = new LoginProcess();

    return login.startProcess()
        .then(function (answer) {
            expect(answer).toContain('Success');
            if (login.dbg) console.log('Login Process answer', answer);
        })
        .thenCatch(function (err) {
            expect(true).toBe(err);
            console.log('Login Process Err', err);
        });
};

module.exports = start;