// Karma configuration
// Generated on Thu Jan 16 2014 14:15:14 GMT+0000 (GMT Standard Time)

module.exports = function(config) {

  /*var webdriverConfig = {
    hostname: 'ondemand.saucelabs.com',
    port: 80 ,
    user: 'jstrong1',
    pwd: 'aa4c7ca9-227d-49b7-9d48-2564c21afce4'
  }*/

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: './',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'lib/angular/angular.js',
      'lib/angular/angular-mocks.js',
      'lib/angular/angular-animate.js',
      'lib/angular/angular-route.js',
      '../javascripts/jquery-2.0.min.js',
      '../javascripts/bootstrap.min.js',
      '../javascripts/custom/*.js',
      'unit/spec/*.js',
    ],


    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    /*
    customLaunchers: {
        'Firefox': {
            base: 'WebDriver',
            config: webdriverConfig,
            browserName: 'firefox',
            name: 'Karma'
        }
    },
    */

    browsers: ['Firefox'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
