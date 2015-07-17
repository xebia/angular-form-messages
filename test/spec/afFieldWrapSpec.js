describe('afFieldWrap', function () {

  beforeAll(function () {
    angular.module('angularFormMessages').directive('isolate', function () {
      return {
        // fieldWrap is in a template to make sure that these elements are in the isolate scope
        template: '<div af-field-wrap="user.name"></div>',
        // Create new isolate scope to demonstrate that the formController is inaccessible in the afFieldWrap
        scope: {}
      };
    });
  });

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope();

    compileHtml('<form name="userForm" af-submit>' +
      '<div isolate></div>' +
    '</form>', this.$scope);
  });

  it('should set the modelPath in the controller from the directive attribute', function () {
    expect(this.element.find('[af-field-wrap]').controller('afFieldWrap').messageId).toBe('user.name');
  });

  it('should put the formController on the scope', function () {
    var innerScope = this.element.find('[af-field-wrap]').scope();
    expect(innerScope.$id).not.toBe(this.$scope.$id);
    expect(innerScope.userForm).toBeDefined();
  });
});
