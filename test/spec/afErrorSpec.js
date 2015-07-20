describe('afError', function () {
  var $rootScope;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    inject(function (_$rootScope_) {
      $rootScope = _$rootScope_;
    });

    createScope({
      messages: [
        { message: 'Initial message', type: 'error' } // Directive has no isolate scope, so we can set values on the parent scope initially
      ]
    });
    this.element = extendedElement(
      compileHtml('<form name="userForm"><div af-field-wrap="user.name"><div af-error></div></div></form>'),
      { error: '[af-error]' }
    );
  });

  describe('when a validation event is broadcasted', function () {
    describe('the the event is not addressed to this field wrap', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.other', []);
        this.$scope.$digest();
      });

      it('should do nothing', function () {
        expect(this.element.find('[af-error]').scope().messages).toEqual([{ message: 'Initial message', type: 'error' }]);
      });
    });

    describe('when the field is valid', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.name', []);
        this.$scope.$digest();
      });

      it('should remove the message', function () {
        expect(this.element.find('[af-error]').scope().messages).toEqual([]);
      });
    });

    describe('when the field is invalid', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.name', [{ message: 'New error', type: 'error' }]);
        this.$scope.$digest();
      });

      it('should set the message on the scope', function () {
        expect(this.element.find('[af-error]').scope().messages).toEqual([{ message: 'New error', type: 'error' }]);
      });
    });
  });
});
