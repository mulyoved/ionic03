var DbTestPage = function() {
    this.dumpAnswer = element(by.binding('dumpAnswer'));
    this.countAnswer = element(by.binding('answerCount'));

    this.click = function(text) {
        element(By.buttonText(text)).click();
    };

    this.get = function() {
        browser.get('/#/dbtest');
    };

    this.deleteDB = function() {
        //deleteDB
        this.deleteDatabase = element(By.id('delete-database'));
        //console.log('this.dumpDatabase', this.dumpDatabase);
        this.deleteDatabase.click();
    };

    this.dumpDB = function() {
        this.dumpDatabase = element(By.buttonText('Dump Database')); //element($("button > span:contains('Dump Database')"));
        this.dumpDatabase.click();
    };

    this.sync = function() {
        this.click('Sync');
    };
};

module.exports = DbTestPage;