// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-04-13 using
// generator-karma 0.9.0

module.exports = function(config) {
  'use strict';

  config.set({
    autoWatch: true,

    basePath: '../',

    frameworks: ['jasmine'],

    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
      'bower_components/mox/dist/mox.js',
      'bower_components/lodash/lodash.js',
      // endbower
      'src/afModule.js',
      'src/bootstrap/afModule.js',
      'src/**/*.js',
      'templates/**/*.html',
      'test/mock/*.js',
      'test/mock/html/**/*.html',
      'test/spec/**/*.js'
    ],

    exclude: [
    ],

    preprocessors: {
      'src/**/*.js': ['coverage'],
      'test/mock/html/**/*.html': 'ng-html2js',
      'templates/**/*.html': 'ng-html2js'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'test/mock/html/'
    },

    reporters: ['progress', 'coverage'],

    port: 8080,

    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-coverage'
    ],

    singleRun: false,

    colors: true,

    // LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    coverageReporter: {
      dir: 'test/coverage',
      reporters: [
        { type: 'lcov' },
        { type: 'text-summary' },
        { type: 'json' }
      ]
    }

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
