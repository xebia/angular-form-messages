describe('afSubmitButton', function () {
  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope();
    compileHtml('<div af-submit-button></div>', this.$scope);
  });

  it('still does nothing', function () {

  });
});
