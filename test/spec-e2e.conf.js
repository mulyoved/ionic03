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

    onPrepare: function() {
        jasmine.getEnv().addReporter(new ScreenshotReporter(".tmp/protractorss"));
    }
};