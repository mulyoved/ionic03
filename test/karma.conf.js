module.exports = function(config) {
    config.set({

        basePath: '../',

        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-animate/angular-animate.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/ionic/release/js/ionic.js',

            'app/bower_components/ionic/release/js/ionic-angular.js',
            'app/bower_components/angular-local-storage/angular-local-storage.js',

            'app/bower_components/pouchdb/dist/pouchdb-nightly.js',
            'app/bower_components/angular-pouchdb/angular-pouchdb.js',
            //'node_modules/jasmine-expect/dist/jasmine-matchers.js',

            'https://apis.google.com/js/api.js',
            'app/bower_components/ngGAPI/gapi.js',


            'app/bower_components/angular-mocks/angular-mocks.js',
            'test/mock/*.js',

            'app/scripts/**/*.js',
            'test/unit/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        reporters: ['progress'],


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
