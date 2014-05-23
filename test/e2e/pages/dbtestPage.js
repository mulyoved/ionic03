var DbTestPage = function() {
    this.dumpAnswer = element(by.binding('dumpAnswer'));
    this.countAnswer = element(by.binding('answerCount'));
    this.postText = element(by.id('newpost-text'));

    this.click = function(text) {
        return browser.actions().mouseMove( element(By.buttonText('Dump Top Record'))).perform()
            .then(function() {
            return element(By.buttonText(text)).click();
        });
    };

    this.get = function() {
        browser.get('/#/dbtest');
    };

    this.deleteDB = function() {
        return this.click('Delete Database');
    };

    this.dumpDB = function() {
        return this.click('Dump Database');
    };

    this.sync = function() {
        return this.click('Sync');
    };

    this.setPostText = function(text) {
        this.postText.clear();
        this.postText.sendKeys(text);
    }

};

module.exports = DbTestPage;