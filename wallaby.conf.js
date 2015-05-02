module.exports = function () {

  function n(file) { return { pattern: file, instrument: false }; }

  return {
    files: [
      // Libraries
      n('bower_components/lodash/lodash.js'),
      n('bower_components/jquery/dist/jquery.js'),
      n('bower_components/angular/angular.js'),
      n('bower_components/angular-messages/angular-messages.js'),
      n('bower_components/angular-mocks/angular-mocks.js'),
      n('bower_components/jasmine-jquery/lib/jasmine-jquery.js'),
      n('bower_components/jasmine-mox-matchers/src/jasmine-mox-matchers-2.x.js'),
      n('bower_components/mox/src/mox.js'),

      // Mock data
      { pattern: 'test/mock/json/**/*.json', instrument: false, load: false },
      n('test/mock/html/**/*.html'),
      n('test/mock/**/*.js'),

      // Scripts
      'src/afModule.js',
      'src/*.js'
    ],
    tests: [
      n('test/spec/**/*.js')
    ],
    preprocessors: {
      'test/mock/html/**/*.html': function (file) {
        return require('wallaby-ng-html2js-preprocessor').transform(file, {
          stripPrefix: 'test/mock/html/'
        });
      }
    }
  };
};