describe('afFieldWrap', function () {
  var $rootScope;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    inject(function (_$rootScope_) {
      $rootScope = _$rootScope_;
    });

    createScope();
    compileHtml('<div af-field-wrap af-model-path="user.name"></div>', this.$scope);
  });

  it('should set the modelPath in the controller from the directive attribute', function () {
    expect(this.element.controller('afFieldWrap').modelPath).toBe('user.name');
  });
});
