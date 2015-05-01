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

  describe('when a validation event has been fired', function () {
    describe('when it is meant for the field wrap with the modelPath attached to the event', function () {
      describe('when the validation is "valid"', function () {
        beforeEach(function () {
          this.element.addClass('has-error');
          $rootScope.$broadcast('validation', 'user.name', true);
        });

        it('should remove the "has-error" class from the element', function () {
          expect(this.element).not.toHaveClass('has-error');
        });
      });

      describe('when the validation is "invalid"', function () {
        beforeEach(function () {
          this.element.removeClass('has-error');
          $rootScope.$broadcast('validation', 'user.name', false);
        });

        it('should add a "has-error" class to the element', function () {
          expect(this.element).toHaveClass('has-error');
        });
      });
    });

    describe('when it is not meant for this field wrap', function () {

      it('should not add the "has-error" class', function () {
        this.element.removeClass('has-error');
        $rootScope.$broadcast('validation', 'user.other', false);
        expect(this.element).not.toHaveClass('has-error');
      });

      it('should not remove the "has-error" class', function () {
        this.element.addClass('has-error');
        $rootScope.$broadcast('validation', 'user.other', true);
        expect(this.element).toHaveClass('has-error');
      });
    });

  });
});
