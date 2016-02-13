describe('afField', function () {
  var
    $scope,
    afField,
    afSubmit,
    element,
    expectRequiredErrorEvent,
    expectValidEvent,
    MESSAGE_TYPES,
    ngModel;

  function makeFieldEmpty() {
    element.field().val('').trigger('input');
  }

  function compile(trigger, fieldTrigger) {
    // Due to a bug in Mox we need to create a new scope before we (re)compile a template, otherwise the scope is gone
    $scope = createScope({ user: { email: 'email@address' } });
    element = addSelectors(compileHtml(
      '<form name="userForm" af-submit ' + (trigger ? 'af-trigger-on="' + trigger + '"' : '') + '>' +
        '<input type="email" af-field name="user.email" ng-model="user.email" af-trigger="triggerValue"' + (fieldTrigger ? 'af-trigger-on="' + fieldTrigger + '"' : '') + ' required />' +
      '</form>'), {
      field: '[af-field]'
    });

    // Setup spies on parent controllers
    afSubmit = element.controller('afSubmit');
    ngModel = element.field().controller('ngModel');
    afField = element.field().controller('afField');
    spyOn($scope, '$emit').and.callThrough();
    spyOn(ngModel, '$validate').and.callThrough();
  }

  function compileWithSubform() {
    $scope = createScope({ user: {
      email: 'email@address',
      email2: undefined
    } });
    element = addSelectors(compileHtml('<form name="userForm" af-submit>' +
        '<div ng-form name="subForm{{$index}}" ng-repeat="field in user">' +
          '<input type="email" af-field name="user.email" ng-model="field" />' +
        '</div>' +
      '</form>'), {
      ngForm: {
        selector: '[ng-form]:eq({0})',
        sub: {
          field: '[af-field]'
        }
      }
    });
    spyOn($scope, '$emit').and.callThrough();
  }

  function compileError(value) {
    $scope = createScope({ user: { email: value } });
    element = addSelectors(compileHtml(
      '<form name="userForm" af-submit>' +
      '<input type="email" af-field name="user.email" ng-model="user.email" af-trigger="triggerValue" ng-required="triggerValue" />' +
      '</form>'), {
      field: '[af-field]'
    });

    spyOn($scope, '$emit').and.callThrough();
  }

  function compileRadio() {
    $scope = createScope({ user: {} });
    spyOn($scope, '$emit').and.callThrough();
    element = addSelectors(compileHtml(
      '<form name="userForm" af-submit>' +
      '<input type="radio" id="{{gender}}" af-field name="user.gender" ng-model="user.gender" ng-value="gender" required ng-repeat="gender in [\'male\', \'female\']" />' +
      '</form>'), {
      field: { repeater: '[af-field]' }
    });
    ngModel = element.field(0).controller('ngModel');
  }

  function expectMessage(type) {
    $scope.$emit.calls.reset();
    $scope.$digest();
    expectEvent([{ message: 'required', type: type }]);
  }

  function expectEvent(messages) {
    expect($scope.$emit).toHaveBeenCalledWith('validation', 'user.email', messages);
  }

  /**
   * afSubmit is cleaning the messages on input, so we have to check for arguments
   */
  function expectNoValidEvent() {
    expect($scope.$emit).not.toHaveBeenCalledWith('validation',  'user.email', []);
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices('AfMessageService')
      .setupResults(function () {
        MESSAGE_TYPES = mox.inject('MESSAGE_TYPES');
        return {
          AfMessageService: {
            getMostSevereMessage: function (messages) {
              return messages.length ? { type: MESSAGE_TYPES[0] } : undefined;
            },
            triggerOn: 'change'
          }
        };
      })
      .run();

    expectValidEvent = _.partial(expectEvent, []);
    expectRequiredErrorEvent = _.partial(expectEvent, [{ message: 'required', type: MESSAGE_TYPES[3] }]);
  });

  describe('on initialization', function () {

    describe('when the field is invalid', function () {
      beforeEach(function () {
        compileError('noEmail');
      });

      it('should emit no validation information', function () {
        expect(element.field().controller('ngModel').$error).toEqual({ email: true });
        expect($scope.$emit).not.toHaveBeenCalled();
      });
    });

    describe('when there are multiple afFields with the same ngModel and each of them with another scope', function () {
      beforeEach(function () {
        compileRadio();
      });

      it('should emit no validation information ', function () {
        expect(ngModel.$error).toEqual({ required: true });
        expect($scope.$emit).not.toHaveBeenCalled();
      });

      describe('when clicking not the last radio', function () {
        beforeEach(function () {
          element.field(0).click().trigger('click');
        });

        it('should set the validity because the clicked radio becomes dirty', function () {
          expect($scope.$emit).toHaveBeenCalled();
        });
      });
    });
  });

  describe('when the field should be validated on change', function () {
    beforeEach(function () {
      compile('change');
    });

    describe('and the user changes the field', function () {
      it('should validate the field as "valid" if it was initially valid', function () {
        element.field().val('other@address').trigger('input');
        expectValidEvent();
      });

      it('should validate the field and set the default (error) message if it was initially valid', function () {
        makeFieldEmpty();
        expectRequiredErrorEvent();
      });

      it('should validate the field and set the default (error) message if it was initially invalid', function () {
        element.field().val('email-invalid').trigger('input');
        makeFieldEmpty();
        expectRequiredErrorEvent();
      });

      it('should not validate the field on blur', function () {
        element.field().trigger('blur');
        expectNoValidEvent();
      });
    });
  });

  describe('when the field should be validated on blur', function () {
    beforeEach(function () {
      compile('blur');
    });

    describe('and the user changes the field without blurring', function () {
      it('should not validate the field', function () {
        element.field().val('other@address').trigger('input');
        expectNoValidEvent();
      });
    });

    describe('and the user blurs the field', function () {
      it('should validate the field', function () {
        element.field().trigger('blur');
        expectValidEvent();
      });
    });
  });

  describe('when the field should be validated on submit', function () {
    beforeEach(function () {
      compile('submit');
    });

    describe('and the user changes and blurs the field', function () {
      beforeEach(function () {
        element.field().val('other@address').trigger('input').trigger('blur');
      });

      it('should not validate the field', function () {
        expectNoValidEvent();
      });
    });
  });

  describe('when there are valid validators on the field and stored in $error', function () {
    // in 1.2 the validators that become valid set the value of $error.key to true, while it is deleted in 1.3
    // Since this test runs in 1.3, we have to set the $error object manually
    beforeEach(function () {
      compile();
      ngModel.$error.email = false;
      ngModel.$error.required = true;

      // Use the trigger value because that triggers the validation event without evaluating the ngModel
      $scope.triggerValue = 'changed';
      $scope.$digest();
    });

    it('should only broadcast messages in the validation event for valid validators', function () {
      expectRequiredErrorEvent();
    });
  });

  describe('when the field has a triggerOn attribute', function () {
    beforeEach(function () {
      compile('change', 'blur');
    });

    it('should override the triggerOn value of the afSubmit directive', function () {
      element.field().trigger('blur');
      expectValidEvent();
    });
  });

  describe('when the trigger value changes', function () {
    beforeEach(function () {
      compileError();
    });

    it('should validate the field', function () {
      $scope.triggerValue = 'changed';
      $scope.$digest();
      expectRequiredErrorEvent();
    });
  });

  describe('when a request for validation event is received', function () {

    // These are the same expectations as the case where the trigger is change and the model changes
    beforeEach(function () {
      compile();
      spyOn(ngModel, '$setValidity').and.callThrough();
      ngModel.$error = { required: true, other: true };
    });

    describe('when it is addressed to this form', function () {
      beforeEach(function () {
        $scope.$emit('validate', 'userForm');
      });

      it('should clear all current validations for the field and for the parent form', function () {
        expect(ngModel.$setValidity).toHaveBeenCalledWith('required', true);
        expect(ngModel.$setValidity).toHaveBeenCalledWith('other', true);
      });

      it('should validate the field in Angular 1.3 and higher', function () {
        expect(ngModel.$validate).toHaveBeenCalled();
      });

      describe('when we use Angular 1.2', function () {
        beforeEach(function () {
          // This method does not exist in 1.2
          delete ngModel.$validate;
          spyOn(ngModel, '$setViewValue');
          $scope.$emit('validate', 'userForm');
        });

        it('should validate the field in Angular 1.2', function () {
          expect(ngModel.$setViewValue).toHaveBeenCalledWith(ngModel.$viewValue);
        });
      });

      it('should send validation "valid" to the ngSubmitController', function () {
        expectValidEvent();
      });

      it('should send validation "invalid" to the ngSubmitController', function () {
        // Make field invalid to trigger a second validation event via the model watch
        makeFieldEmpty();
        expectRequiredErrorEvent();
      });
    });

    describe('when it is not addressed to this form', function () {
      beforeEach(function () {
        pending();
        $scope.$emit('validate', 'otherForm');
      });

      it('should do nothing', function () {
        expect(ngModel.$setValidity).not.toHaveBeenCalled();
        expect(ngModel.$validate).not.toHaveBeenCalled();
      });
    });
  });

  describe('when a setValidity event is received', function () {
    beforeEach(function () {
      compile();
      spyOn(ngModel, '$setValidity').and.callThrough();
    });

    describe('when it is addressed to this field', function () {
      var messages;

      function expectValidation() {
        $scope.$broadcast('setValidity', 'userForm.user.email', messages);
        $scope.$digest();
        expect(ngModel.$dirty).toBe(false);
        expect($scope.$emit).toHaveBeenCalledWith('validation', 'user.email', messages);
      }

      beforeEach(function () {
        messages = [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning message', type: MESSAGE_TYPES[2] }];
        spyOn(afField, 'setMessageDetails').and.callThrough();
        // set isPristineAfterSubmit to true so that messages are cleared on next view change
        $scope.$broadcast('setValidity', 'userForm.user.email', messages);
      });

      it('should set the validity and message type for the field', function () {
        expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', false);
        expect(afField.setMessageDetails).toHaveBeenCalledWith('User name server side error', MESSAGE_TYPES[3]);
      });

      it('should emit the validation information despite the field is not dirty', function () {
        expectValidation();
      });

      it('should emit the validation information as well when the field is not triggered on change', function () {
        compile('blur');
        expectValidation();

        compile('submit');
        expectValidation();
      });

      describe('and the user changes the field thereafter', function () {
        beforeEach(function () {
          ngModel.$setValidity.calls.reset();
          element.field().val('noemail').trigger('input');
        });

        it('should clear validation errors and do a revalidation', function () {
          expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', true);
          expect(ngModel.$setValidity).toHaveBeenCalledWith('Warning message', true);
          expect(ngModel.$setValidity).toHaveBeenCalledWith('email', true);
          expect(ngModel.$error).toEqual({ email: true });
        });
      });

      describe('when the field in a subform with dynamic name', function () {
        beforeEach(function () {
          $scope.$emit.calls.reset();
          compileWithSubform();
        });

        it('should also process validity if there is an afField in a (sub)form with this name', function () {
          $scope.$broadcast('setValidity', 'subForm1.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
          expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', false);

          ngModel.$setValidity.calls.reset();

          $scope.$broadcast('setValidity', 'subFormNotExisting.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
          expect(ngModel.$setValidity).not.toHaveBeenCalledWith('User name server side error', false);
        });
      });
    });

    describe('when it is not addresses to this field', function () {
      beforeEach(function () {
        $scope.$broadcast('setValidity', 'user.other', [{ message: 'Warning', type: MESSAGE_TYPES[3] }]);
      });

      it('does nothing', function () {
        expect(ngModel.$setValidity).not.toHaveBeenCalled();
      });
    });
  });

  describe('when extra validation info is set in afField.$messages', function () {
    beforeEach(function () {
      compile();
    });

    it('should validate the field and set the default message with the type that has been set via afField methods', function () {
      afField.setErrorDetails('required');
      makeFieldEmpty();
      expect($scope.$emit).toHaveBeenCalledWith('validation', 'user.email', [{ message: 'required', type: MESSAGE_TYPES[3] }]);

      afField.setWarningDetails('required');
      $scope.triggerValue = 'something-else';
      expectMessage(MESSAGE_TYPES[2]);

      afField.setInfoDetails('required');
      $scope.triggerValue = 'another-value';
      expectMessage(MESSAGE_TYPES[1]);

      afField.setSuccessDetails('required');
      $scope.triggerValue = 'trigger-again';
      expectMessage(MESSAGE_TYPES[0]);

      afField.setMessageDetails('required', MESSAGE_TYPES[3]);
      $scope.triggerValue = 'trigger';
      expectMessage(MESSAGE_TYPES[3]);
    });
  });

});
