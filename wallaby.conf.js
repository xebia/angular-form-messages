module.exports = function () {

  return {
    files: [
      // Libraries
      { pattern: 'bower_components/jquery/dist/jquery.js', instrument: false },
      { pattern: 'bower_components/angular/angular.js', instrument: false },
      { pattern: 'bower_components/angular-messages/angular-messages.js', instrument: false },
      { pattern: 'bower_components/angular-mocks/angular-mocks.js', instrument: false },
      { pattern: 'bower_components/jasmine-jquery/lib/jasmine-jquery.js', instrument: false },
      { pattern: 'bower_components/mox/src/mox.js', instrument: false },

      // Mock data
      { pattern: 'test/mock/json/**/*.json', instrument: false, load: false },
      { pattern: 'test/mock/html/**/*.html', instrument: false },
      { pattern: 'test/mock/**/*.js', instrument: false },

      // Scripts
      'src/afModule.js',
      'src/*.js'
    ],
    tests: [
      { pattern: 'test/spec/**/*.js', instrument: false }
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