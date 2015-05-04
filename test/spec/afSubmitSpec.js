describe('afSubmit', function () {
  var
    callbackResult = {
      validation: {
        OMGWTF: { message: 'OMGWTF geen error', isValid: true },
        'user.name': { message: 'User name server side error', isValid: false }
      }
    },
    submit;

  function compileWithTrigger($scope, trigger) {
    compileHtml('<form af-submit="submit()" af-trigger="' + trigger + '"></form>', $scope);
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope({
      submit: jasmine.createSpy('submit callback')
    });
    compileWithTrigger(this.$scope, 'change');
    submit = this.element.controller('afSubmit');
    spyOn(submit, 'validate').and.callThrough();
    this.$scope.submit.and.returnValue(reject(callbackResult));
  });

  describe('the trigger setting', function () {

    it('should be saved in the controller with value from the af-trigger attribute', function () {
      expect(submit.trigger).toBe('change');
    });

    it('should be saved in the controller with a default value', function () {
      compileWithTrigger(this.$scope, undefined);
      expect(submit.trigger).toBe('change');
    });
  });

  describe('on form submit', function () {

    beforeEach(function () {
      spyOn(this.$scope, '$broadcast');
    });

    it('should request validation from all form elements', function () {
      this.element.submit();
      expect(this.$scope.$broadcast).toHaveBeenCalledWith('validate');
    });

    describe('when the form is client side valid', function () {

      it('should call the submit callback', function () {
        this.element.submit();
        expect(this.$scope.submit).toHaveBeenCalled();
      });

      describe('when the submit callback returns a rejecting promise', function () {
        beforeEach(function () {
          this.element.submit();
        });

        it('should save the validation results', function () {
          expect(submit.validations).toEqual(callbackResult.validation);
        });

        it('sends a validation event per server side validation', function () {
          expect(this.$scope.$broadcast).toHaveBeenCalledWith('validation', 'OMGWTF', true, 'OMGWTF geen error');
          expect(this.$scope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', false, 'User name server side error');
        });
      });

      describe('when the submit callback does not return a promise', function () {
        beforeEach(function () {
          this.$scope.submit.and.returnValue('noPromise');
          this.element.submit();
        });

        it('does no further processing', function () {
          expect(submit.validate).not.toHaveBeenCalled();
        });
      });
    });

    describe('when the form is client side invalid', function () {
      beforeEach(function () {
        submit.validations = [{
          isValid: true
        },
        {
          isValid: false
        }];
        this.element.submit();
      });

      it('should stop further processing', function () {
        expect(this.$scope.submit).not.toHaveBeenCalled();
      });
    });
  });
});
