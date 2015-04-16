describe('afError', function () {
  beforeEach(function () {
    mox
      .module('angularFormMessages', 'templates/error.html')
      .run();

    createScope({ message: 'error message'});
    compileHtml('<div af-error></div>', this.$scope);
  });

  it('should show a message', function () {
    expect(this.element.find('div')).toHaveText('error message');
  });
});