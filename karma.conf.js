// Karma configuration
// Generated on Fri May 09 2014 20:26:38 GMT+0300 (Jerusalem Summer Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    //frameworks: ['mocha', 'requirejs', 'chai', 'sinon'],
    frameworks: ['requirejs', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
        'app/bower_components/angular/angular.js',
        'app/bower_components/angular-animate/angular-animate.js',
        'app/bower_components/angular-sanitize/angular-sanitize.js',
        'app/bower_components/angular-ui-router/release/angular-ui-router.js',
        'app/bower_components/ionic/release/js/ionic.js',

        'app/bower_components/ionic/release/js/ionic-angular.js',
        'app/bower_components/angular-local-storage/angular-local-storage.js',

        //'app/bower_components/pouchdb/dist/pouchdb-nightly.js',
        'app/bower_components/angular-pouchdb/angular-pouchdb.js',

        'https://apis.google.com/js/api.js',
        'app/bower_components/ngGAPI/gapi.js',

        'app/bower_components/angular-mocks/angular-mocks.js',
        'app/scripts/*.js',

        'test/test-main.js',
        {pattern: 'test/**/*.js', included: false}
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
