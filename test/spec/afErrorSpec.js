describe('afError', function () {
  beforeEach(function () {
    mox
      .module('angularFormMessages', 'templates/error.html')
      .run();

    createScope({ message: 'error message'});
    compileHtml('<div af-field-wrap><div af-error></div></div>', this.$scope);
  });

  it('should show a message', function () {
    expect(this.element.find('[af-error]')).toHaveText('error message');
  });
});
