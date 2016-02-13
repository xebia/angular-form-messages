module.exports = [
  {
    type: 'lib',
    files: [
      'node_modules/lodash/lodash.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'node_modules/angular-mox/dist/mox.js'
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
