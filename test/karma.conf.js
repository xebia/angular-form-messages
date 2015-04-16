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
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
      'bower_components/mox/src/mox.js',
      // endbower
      'src/afModule.js',
      'src/*.js',
      'test/mock/karma-jasmine-jquery.js',
      'test/mock/html/**/*.html',
      'test/spec/**/*.js'
    ],

    exclude: [
    ],

    preprocessors: {
      'test/mock/html/**/*.html': 'ng-html2js'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'test/mock/html/'
    },

    port: 8080,

    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],

    singleRun: false,

    colors: true,

    // LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
