var karmaFiles = require('test-runner-config').getKarmaFiles(require('./testFiles.js'));

module.exports = function (config) {
  'use strict';

  config.set({
    autoWatch: true,
    basePath: '../',
    frameworks: ['jasmine'],
    files: karmaFiles.files,
    exclude: karmaFiles.exclude,
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
    browsers: ['PhantomJS2'],
    plugins: [
      'karma-phantomjs2-launcher',
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
