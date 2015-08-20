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
    form,
    MESSAGE_TYPES,
    submit;

  function compile(trigger, scrollToError, showSuccess) {
    compileHtml('<form af-submit="submit()" name="userForm" ' +
                (trigger ? 'af-trigger-on="' + trigger + '"' : '') +
                (scrollToError === undefined ? '' : 'af-scroll-to-error="' + scrollToError + '"') +
                (showSuccess === undefined ? '' : 'af-show-success="' + showSuccess + '"') + '>' +
                  '<input af-field name="first" ng-model="first"><input af-field name="user.name" ng-model="user.name">' +
                '</form>', this.$scope);
    submit = this.element.controller('afSubmit');
    form = this.element.controller('form');
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices('AfMessageService')
      .mockDirectives('afField')
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
      submit: jasmine.createSpy('submit callback')
    });
    compile.call(this);

    MESSAGE_TYPES = mox.inject('MESSAGE_TYPES');
    this.$scope.submit.and.returnValue(reject(callbackResult));
  });

  describe('the form settings', function () {

    describe('the trigger setting', function () {
      it('should be saved in the controller without a default value', function () {
        expect(this.element.controller('afSubmit').triggerOn).toBeUndefined();
      });

      it('should be saved in the controller with value from the af-trigger-on attribute', function () {
        compile.call(this, 'blur');
        expect(submit.triggerOn).toBe('blur');
      });
    });

    describe('the scrollToError setting', function () {
      it('should be saved in the controller with a default value from AfMessageService.scrollToError()', function () {
        expect(submit.scrollToError).toBe(true);

        mox.get.AfMessageService.scrollToError.and.returnValue(false);
        compile.call(this);
        expect(submit.scrollToError).toBe(false);
      });

      it('should be saved in the controller with boolean value from the af-scroll-to-error attribute', function () {
        compile.call(this, undefined, '\'truthy value as string\'');
        expect(submit.scrollToError).toBe(true);

        compile.call(this, undefined, false);
        expect(submit.scrollToError).toBe(false);
      });
    });

    describe('the showSuccess setting', function () {
      it('should be saved in the controller with a default value from AfMessageService.showSuccess()', function () {
        expect(submit.showSuccess).toBe(false);

        mox.get.AfMessageService.showSuccess.and.returnValue('truthy value');
        compile.call(this);
        expect(submit.showSuccess).toBe(true);
      });

      it('should be saved in the controller with boolean value from the af-show-success attribute', function () {
        compile.call(this, undefined, undefined, '\'truthy value as string\'');
        expect(submit.showSuccess).toBe(true);

        compile.call(this, undefined, undefined, false);
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

          var nameField;

          beforeEach(function () {
            form.$setDirty();
            this.element.submit();

            nameField = this.element.find('[name="user.name"]');
            nameField.controller('ngModel').$setValidity('required', false);
            this.$scope.$digest();
          });

          it('sends a setValidity event per server side validation', function () {
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm.address', []);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm.user.name', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }]);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('setValidity', 'userForm', [{ message: 'Form error', type: MESSAGE_TYPES[2] }]);
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
              expect(nameField).toBeFocused();
              expect(this.element.find('[name="first"]')).not.toBeFocused();
            });
          });

          describe('when afSubmit.scrollToError is false', function () {
            beforeEach(function () {
              submit.scrollToError = false;
            });

            it('should not autofocus', function () {
              $timeout.flush(1000);
              expect(nameField).not.toBeFocused();
            });
          });
        });
      });

      describe('when the submit callback does not return a promise', function () {
        beforeEach(function () {
          this.$scope.submit.and.returnValue(callbackResult);
          form.$setDirty();
          this.element.submit();
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

  describe('when the validate event is received', function () {
    beforeEach(function () {
      form.$setValidity('someServerSideError', false);
      form.$setValidity('anotherError', false);
      this.$scope.$broadcast('validate');
    });

    it('should make the form valid', function () {
      expect(form.$valid).toBe(true);
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
