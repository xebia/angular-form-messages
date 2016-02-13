module.exports = [
  {
    type: 'lib',
    files: [
      'bower_components/lodash/lodash.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
      'bower_components/mox/dist/mox.js'
    ]
  },
  {
    type: 'config',
    files: [
      'test/mock/moxConfig.js',
      'test/mock/testConfig.js'
    ]
  },
  {
    type: 'src',
    files: [
      'src/afModule.js',
      'src/bootstrap/afModule.js',
      'src/**/*.js',
      'templates/**/*.html'
    ]
  },
  {
    type: 'specs',
    files: [
      'test/spec/**/*.js'
    ]
  }
];
