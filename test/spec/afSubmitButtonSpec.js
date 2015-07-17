describe('afSubmitButton', function () {
  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope();
    compileHtml('<div af-submit-button></div>');
  });

  it('should set the disabled attribute when isSubmitted is truthy', function () {
    expect(this.element).not.toHaveAttr('disabled');

    this.$scope.isSubmitting = true;
    this.$scope.$digest();
    expect(this.element).toHaveAttr('disabled', 'disabled');

    this.$scope.isSubmitting = false;
    this.$scope.$digest();
    expect(this.element).not.toHaveAttr('disabled');
  });
});
