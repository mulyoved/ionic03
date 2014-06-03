var ScreenshotReporter = require('./ScreenshotReporter.js');

exports.config = {
    seleniumAddress: "http://127.0.0.1:4444/wd/hub",
    seleniumPort: null,
    seleniumArgs: [],
    specs: [
        './e2e/*spec.{js,coffee}',
        './e2e/pages/*.{js,coffee}'
    ],
    capabilities: {
        'browserName': 'chrome'
    },
    baseUrl: 'http://localhost:9000',
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: false
    },
    suites: {
        slogin: './e2e/simplified_login.spec.js',
        login: './e2e/login.spec.js',
        dbtest: './e2e/dbtest.spec.js',
        browse: './e2e/browse.spec.js'
    },
    params: {
        login: {
            user: 'bloggerApplication',
            password: 'Giza2000'
        }
    },

    onPrepare: function() {
        jasmine.getEnv().addReporter(new ScreenshotReporter("test/.tmp"));
    }
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

