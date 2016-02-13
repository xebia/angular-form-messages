module.exports = function (config) {
  'use strict';

  config.set({
    autoWatch: true,
    basePath: '../',
    frameworks: ['jasmine'],
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
      'bower_components/mox/dist/mox.js',
      'bower_components/lodash/lodash.js',
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
    browsers: ['PhantomJS'],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-coverage'
    ],
    singleRun: false,
    colors: true,
    logLevel: config.LOG_INFO,
    coverageReporter: {
      dir: 'test/coverage',
      reporters: [
        { type: 'lcov' },
        { type: 'text-summary' },
        { type: 'json' }
      ]
    }
  });
};
