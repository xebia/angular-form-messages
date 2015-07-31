describe('afSubmit', function () {
  var
    callbackResult = {
      validation: {
        userForm: {
          address: [],
          'user.name': [
            {
              message: 'User name server side error',
              type: 'ERROR'
            }
          ]
        }
      }
    },
    form,
    MESSAGE_TYPES,
    submit;

  function compileWithTrigger($scope, trigger) {
    compileHtml('<form af-submit="submit()" af-trigger-on="' + trigger + '" af-show-success="showSuccess"></form>', $scope);
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices('MessageService')
      .setupResults(function () {
        MESSAGE_TYPES = mox.inject('MESSAGE_TYPES');
        return {
          MessageService: { determineMessageType: MESSAGE_TYPES[0] }
        };
      })
      .mockDirectives('afField')
      .run();

    createScope({
      submit: jasmine.createSpy('submit callback')
    });
    compileWithTrigger(this.$scope, 'change');
    submit = this.element.controller('afSubmit');
    form = this.element.controller('form');
    this.$scope.submit.and.returnValue(reject(callbackResult));
  });

  describe('the form settings', function () {

    describe('the trigger setting', function () {

      it('should be saved in the controller with value from the af-trigger attribute', function () {
        expect(submit.triggerOn).toBe('change');
      });

      it('should be saved in the controller with a default value', function () {
        compileWithTrigger(this.$scope, undefined);
        expect(submit.triggerOn).toBe('change');
      });
    });

    describe('the showSuccess setting', function () {
      it('should be saved in the controller with boolean value from the af-show-success attribute', function () {
        this.$scope.showSuccess = true;
        this.$scope.$digest();
        expect(submit.showSuccess).toBe(true);

        this.$scope.showSuccess = false;
        this.$scope.$digest();
        expect(submit.showSuccess).toBe(false);
      });

      it('should be saved in the controller with a default value', function () {
        expect(submit.showSuccess).toBe(false);
      });
    });
  });

  describe('on form submit', function () {

    var $rootScope;

    beforeEach(function () {
      $rootScope = mox.inject('$rootScope');
      // Warning: since all child scopes inherit from $rootScope, the child scopes are also watched
      spyOn(mox.inject('$rootScope'), '$broadcast');
    });

    it('should request validation from all form elements', function () {
      this.element.submit();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validate');
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

          it('sends a setValidity event per server side validation', function () {
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm.address', []);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm.user.name', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }]);
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
          expect($rootScope.$broadcast).not.toHaveBeenCalledWith('validation');
        });

        it('should not set $scope.isSubmitting', function () {
          expect(this.$scope.isSubmitting).toBeUndefined();
        });
      });
    });

    describe('when the form is client side invalid', function () {
      beforeEach(function () {
        form.$valid = false;
        this.element.submit();
      });

      it('should stop further processing', function () {
        expect(this.$scope.submit).not.toHaveBeenCalled();
      });
    });

    describe('when the form has only empty errors', function () {
      beforeEach(function () {
        form.$valid = true;
        this.element.submit();
      });

      it('should continue further processing', function () {
        expect(this.$scope.submit).toHaveBeenCalled();
      });
    });
  });
});
