var ScreenshotReporter = require('./ScreenshotReporter.js');

exports.config = {
    seleniumAddress: "http://127.0.0.1:4723/wd/hub",
    seleniumPort: null,
    seleniumArgs: [],
    specs: [
        './e2e/*spec.{js,coffee}',
        './e2e/pages/*.{js,coffee}'
    ],
    chromeOnly: false,
    capabilities: {
        //device: 'android',
        //automationName: 'selendroid',
        platform: 'Android',
        platformName: 'Android',
        platformVersion: "4.4",
        'browserName': '',
        'deviceName' : 'Android Emulator',
        "appPackage": "com.example.Ionic03",
        "appActivity" : 'Ionic03'
        //'app'
    },
    suites: {
        dbtest: './e2e/dbtest.spec.js',
        browse: './e2e/browse.spec.js'
    },
    params: {
        login: {
            user: 'bloggerApplication',
            password: 'Giza2000'
        }
    },
    //baseUrl: 'http://10.0.2.2:' + (process.env.HTTP_PORT || '8000'),
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: true,
        showColors: true,
        includeStackTrace: true
    },
    'webviewSupport': true,

    /*
    onPrepare: function() {
        jasmine.getEnv().addReporter(new ScreenshotReporter(".tmp/protractorss"));
    }
    */
};
