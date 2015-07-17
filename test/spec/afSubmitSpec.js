describe('afSubmit', function () {
  var
    callbackResult = {
      validation: {
        address: [],
        'user.name': ['User name server side error']
      }
    },
    submit;

  function compileWithTrigger($scope, trigger) {
    compileHtml('<form af-submit="submit()" af-trigger-on="' + trigger + '"></form>', $scope);
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
      expect(submit.triggerOn).toBe('change');
    });

    it('should be saved in the controller with a default value', function () {
      compileWithTrigger(this.$scope, undefined);
      expect(submit.triggerOn).toBe('change');
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

      describe('when the submit callback returns a promise', function () {

        describe('which does not resolve', function () {
          it('should set $scope.isSubmitting to true', function () {
            this.$scope.submit.and.returnValue(unresolvedPromise());
            this.element.submit();
            expect(this.$scope.isSubmitting).toBe(true);
          });
        });

        describe('which resolves', function () {
          it('should set $scope.isSubmitting to false', function () {
            this.element.submit();
            expect(this.$scope.isSubmitting).toBe(false);
          });
        });

        describe('which rejects', function () {

          beforeEach(function () {
            this.element.submit();
          });

          it('should save the validation results', function () {
            expect(submit.validations).toEqual(callbackResult.validation);
          });

          it('sends a validation event per server side validation', function () {
            expect(this.$scope.$broadcast).toHaveBeenCalledWith('validation', 'address', []);
            expect(this.$scope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', ['User name server side error']);
          });

          it('should set $scope.isSubmitting to false', function () {
            expect(this.$scope.isSubmitting).toBe(false);
          });
        });
      });

      describe('when the submit callback does not return a promise', function () {
        beforeEach(function () {
          this.$scope.submit.and.returnValue(callbackResult);
          this.element.submit();
        });

        it('does no further processing', function () {
          expect(submit.validate).not.toHaveBeenCalled();
        });

        it('should not set $scope.isSubmitting', function () {
          expect(this.$scope.isSubmitting).toBeUndefined();
        });
      });
    });

    describe('when the form is client side invalid', function () {
      beforeEach(function () {
        submit.validations = {
          'user.name': [{
            isValid: true
          }, {
            isValid: false
          }]
        };
        this.element.submit();
      });

      it('should stop further processing', function () {
        expect(this.$scope.submit).not.toHaveBeenCalled();
      });
    });

    describe('when the form has only empty errors', function () {
      beforeEach(function () {
        submit.validations = {
          'user.name': []
        };
        this.element.submit();
      });

      it('should continue further processing', function () {
        expect(this.$scope.submit).toHaveBeenCalled();
      });
    });
  });
});
