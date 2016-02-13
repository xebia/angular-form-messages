describe('afSubmit', function () {
  var
    $timeout,
    callbackResult = {
      validation: {
        userForm: {
          $messages: [
            {
              message: 'Form error',
              type: 'WARNING'
            }
          ],
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
    element,
    form,
    MESSAGE_TYPES,
    submit;

  function compile(trigger, scrollToError, showSuccess) {
    element = addSelectors(compileHtml('<form af-submit="submit()" name="userForm" ' +
                (trigger ? 'af-trigger-on="' + trigger + '"' : '') +
                (scrollToError === undefined ? '' : 'af-scroll-to-error="' + scrollToError + '"') +
                (showSuccess === undefined ? '' : 'af-show-success="' + showSuccess + '"') + '>' +
                  '<input af-field name="first" ng-model="first" required>' +
                  '<input af-field name="user.name" ng-model="user.name" required>' +
                '</form>'), {
      field: { repeater: '[af-field]' }
    });
    submit = element.controller('afSubmit');
    form = element.controller('form');
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices('AfMessageService')
      .setupResults(function () {
        return {
          AfMessageService: {
            scrollToError: true,
            showSuccess: false
          }
        };
      })
      .run();

    $timeout = mox.inject('$timeout');

    createScope({
      submit: jasmine.createSpy('submit callback'),
      first: 'first',
      user: { name: 'name' }
    });
    compile();

    MESSAGE_TYPES = mox.inject('MESSAGE_TYPES');
    this.$scope.submit.and.returnValue(reject(callbackResult));
  });

  describe('the form settings', function () {

    describe('the trigger setting', function () {
      it('should be saved in the controller without a default value', function () {
        expect(element.controller('afSubmit').triggerOn).toBeUndefined();
      });

      it('should be saved in the controller with value from the af-trigger-on attribute', function () {
        compile('blur');
        expect(submit.triggerOn).toBe('blur');
      });
    });

    describe('the scrollToError setting', function () {
      it('should be saved in the controller with a default value from AfMessageService.scrollToError()', function () {
        expect(submit.scrollToError).toBe(true);

        mox.get.AfMessageService.scrollToError.and.returnValue(false);
        compile();
        expect(submit.scrollToError).toBe(false);
      });

      it('should be saved in the controller with boolean value from the af-scroll-to-error attribute', function () {
        compile(undefined, '\'truthy value as string\'');
        expect(submit.scrollToError).toBe(true);

        compile(undefined, false);
        expect(submit.scrollToError).toBe(false);
      });
    });

    describe('the showSuccess setting', function () {
      it('should be saved in the controller with a default value from AfMessageService.showSuccess()', function () {
        expect(submit.showSuccess).toBe(false);

        mox.get.AfMessageService.showSuccess.and.returnValue('truthy value');
        compile();
        expect(submit.showSuccess).toBe(true);
      });

      it('should be saved in the controller with boolean value from the af-show-success attribute', function () {
        compile(undefined, undefined, '\'truthy value as string\'');
        expect(submit.showSuccess).toBe(true);

        compile(undefined, undefined, false);
        expect(submit.showSuccess).toBe(false);
      });
    });
  });

  describe('on form submit', function () {

    var $rootScope;

    beforeEach(function () {
      $rootScope = mox.inject('$rootScope');
      // Warning: since all child scopes inherit from $rootScope, the child scopes are also watched
      spyOn(mox.inject('$rootScope'), '$broadcast').and.callThrough();
    });

    it('should request validation from all form elements', function () {
      element.submit();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validate', 'userForm');
    });

    describe('when the form is client side valid', function () {

      it('should call the submit callback', function () {
        element.submit();
        expect(this.$scope.submit).toHaveBeenCalled();
      });

      describe('when the submit callback returns a promise', function () {

        describe('which does not resolve', function () {
          it('should set $scope.isSubmitting to true', function () {
            this.$scope.submit.and.returnValue(unresolvedPromise());
            element.submit();
            expect(this.$scope.isSubmitting).toBe(true);
          });
        });

        describe('which resolves', function () {
          it('should set $scope.isSubmitting to false', function () {
            element.submit();
            expect(this.$scope.isSubmitting).toBe(false);
          });
        });

        describe('which rejects', function () {

          beforeEach(function () {
            element.submit();
            this.$scope.$digest();
          });

          it('sends a setValidity event per server side validation', function () {
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm.address', []);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm.user.name', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }]);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm', [{ message: 'Form error', type: MESSAGE_TYPES[2] }]);
            expect(element.field(0).controller('ngModel').$error).toEqual({});
            expect(element.field(1).controller('ngModel').$error).toEqual({ 'User name server side error': true });
            expect(element.controller('form').$error).toEqual(jasmine.objectContaining({ 'Form error': [undefined] }));
          });

          it('should set $scope.isSubmitting to false', function () {
            expect(this.$scope.isSubmitting).toBe(false);
          });

          it('should make the form pristine', function () {
            expect(form.$pristine).toBe(true);
          });

          describe('when afSubmit.scrollToError is true', function () {
            it('should autofocus the first field that contains a message', function () {

              $timeout.flush(1000);
              expect(element.field(1)).toBeFocused();
              expect(element.field(0)).not.toBeFocused();
            });
          });

          describe('when afSubmit.scrollToError is false', function () {
            beforeEach(function () {
              submit.scrollToError = false;
            });

            it('should not autofocus', function () {
              $timeout.flush(1000);
              expect(element.field(1)).not.toBeFocused();
            });
          });
        });
      });

      describe('when the submit callback does not return a promise', function () {
        beforeEach(function () {
          this.$scope.submit.and.returnValue(callbackResult);
          form.$setDirty();
          element.submit();
        });

        it('does no further processing', function () {
          expect(form.$dirty).toBe(true);
        });

        it('should not set $scope.isSubmitting', function () {
          expect(this.$scope.isSubmitting).toBeUndefined();
        });
      });
    });

    describe('when the form is client side invalid', function () {
      beforeEach(function () {
        element.field(1).val('').trigger('input');
        element.submit();
      });

      it('should autofocus the first field that contains a message', function () {
        expect(element.field(1)).toBeFocused();
        expect(element.field(0)).not.toBeFocused();
      });

      it('should stop further processing', function () {
        expect(this.$scope.submit).not.toHaveBeenCalled();
      });
    });

    describe('when the form has only empty errors', function () {
      beforeEach(function () {
        form.$valid = true;
        element.submit();
      });

      it('should continue further processing', function () {
        expect(this.$scope.submit).toHaveBeenCalled();
      });
    });
  });

  describe('when the validate event is received', function () {
    beforeEach(function () {
      form.$setValidity('someServerSideError', false);
      form.$setValidity('anotherError', false);
    });

    describe('and it is addressed to this form', function () {
      beforeEach(function () {
        this.$scope.$broadcast('validate', 'userForm');
      });

      it('should make the form valid', function () {
        expect(form.$valid).toBe(true);
      });
    });

    describe('and it is not addressed to this form', function () {
      beforeEach(function () {
        pending();
        this.$scope.$broadcast('validate', 'otherForm');
      });

      it('should do nothing', function () {
        expect(form.$valid).toBe(false);
      });
    });

  });

  describe('when the form becomes dirty', function () {
    beforeEach(function () {
      form.$setValidity('someServerSideError', false);
      form.$setValidity('anotherError', false);
      form.$setDirty();
      this.$scope.$digest();
    });

    it('should make the form valid', function () {
      expect(form.$valid).toBe(true);
    });
  });

  describe('when the setValidity event is received', function () {
    beforeEach(function () {
      spyOn(this.$scope, '$emit');
      spyOn(form, '$setValidity');
    });

    describe('and it has the same messageId as the form name', function () {
      beforeEach(function () {
        this.$scope.$broadcast('setValidity', 'userForm', [{ message: 'required', type: MESSAGE_TYPES[3] }, { message: 'email', type: MESSAGE_TYPES[0] }]);
      });

      it('should set the validity of the form', function () {
        expect(form.$setValidity).toHaveBeenCalledWith('required', false);
        expect(form.$setValidity).toHaveBeenCalledWith('email', false);
        expect(this.$scope.$emit).toHaveBeenCalled();
      });
    });

    describe('and it has another messageId than the form name', function () {
      beforeEach(function () {
        this.$scope.$broadcast('setValidity', 'userForm.name', [{ message: 'required', type: MESSAGE_TYPES[3] }, { message: 'email', type: MESSAGE_TYPES[0] }]);
      });

      it('should do nothing because the event is addressed to a field', function () {
        expect(form.$setValidity).not.toHaveBeenCalled();
        expect(this.$scope.$emit).not.toHaveBeenCalled();
      });
    });
  });
});
