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
        device: 'android',
        'browserName': 'Android',
        'deviceName' : 'Android Emulator',
        "appPackage": "com.example.Ionic03",
        "appActivity" : 'Ionic03',
        //'app'
    },
    baseUrl: 'http://10.0.2.2:' + (process.env.HTTP_PORT || '8000'),
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: false
    },

    onPrepare: function() {
        jasmine.getEnv().addReporter(new ScreenshotReporter(".tmp/protractorss"));
    }
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

