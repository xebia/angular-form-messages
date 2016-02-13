var wallabyFiles = require('test-runner-config').getWallabyFiles(require('./test/testFiles.js'));

module.exports = function () {

  return {
    files: wallabyFiles.files,
    tests: wallabyFiles.tests,
    preprocessors: {
      'templates/**/*.html': function (file) {
        return require('wallaby-ng-html2js-preprocessor').transform(file);
      }
    },
    env: {
      runner: require('phantomjs2-ext').path,
      params: {
        runner: '--web-security=false'
      }
    }
  };
};
