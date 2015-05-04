describe('afError', function () {
  var $rootScope;

  beforeEach(function () {
    mox
      .module('angularFormMessages', 'templates/error.html')
      .run();

    inject(function (_$rootScope_) {
      $rootScope = _$rootScope_;
    });

    createScope({
      message: 'Initial message' // Directive has no isolate scope, so we can set values on the parent scope
    });
    this.element = extendedElement(
      compileHtml('<div af-field-wrap af-model-path="user.name"><div af-error></div></div>', this.$scope),
      { error: '[af-error]' }
    );
  });

  describe('when a validation event is broadcasted', function () {
    describe('the the event is not addressed to this field wrap', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.other', true, 'The field is valid');
        this.$scope.$digest();
      });

      it('should do nothing', function () {
        expect(this.element.error).toHaveText('Initial message');
      });
    });

    describe('when the field is valid', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.name', true, 'The field is valid');
        this.$scope.$digest();
      });

      it('should remove the message', function () {
        expect(this.element.error).toHaveText('');
      });
    });

    describe('when the field is invalid', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.name', false, 'New error');
        this.$scope.$digest();
      });

      it('should set the message on the scope', function () {
        expect(this.element.error).toHaveText('New error');
      });
    });
  });
});
