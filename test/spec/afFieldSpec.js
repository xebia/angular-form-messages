describe('afField', function () {
  function makeFieldEmpty() {
    this.element.field().val('').trigger('input');
  }

  function compile(trigger, fieldTrigger) {
    // Due to a bug in Mox we need to create a new scope before we (re)compile a template, otherwise the scope is gone
    createScope({ user: { email: 'email@address' } });
    var element = addSelectors(compileHtml(
      '<form name="userForm" af-submit ' + (trigger ? 'af-trigger-on="' + trigger + '"' : '') + '>' +
        '<input type="email" af-field name="user.email" ng-model="user.email" af-trigger="triggerValue"' + (fieldTrigger ? 'af-trigger-on="' + fieldTrigger + '"' : '') + ' required />' +
      '</form>'), {
      field: '[af-field]'
    });

    // Setup spies on parent controllers
    afSubmit = element.controller('afSubmit');
    ngModel = element.field().controller('ngModel');
    afField = element.field().controller('afField');
    spyOn(this.$scope, '$emit').and.callThrough();
    spyOn(ngModel, '$validate');
  }

  function compileWithSubform() {
    createScope({ user: {
      email: 'email@address',
      email2: undefined
    } });
    addSelectors(compileHtml('<form name="userForm" af-submit>' +
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
    spyOn(this.$scope, '$emit').and.callThrough();
  }

  function expectMessage(type) {
    this.$scope.$emit.calls.reset();
    this.$scope.$digest();
    expectEvent.call(this, [{ message: 'required', type: type }]);
  }

  function expectEvent(messages) {
    expect(this.$scope.$emit).toHaveBeenCalledWith('validation', 'user.email', messages);
  }

  function expectNoValidEvent() {
    expect(this.$scope.$emit).not.toHaveBeenCalledWith('validation',  'user.email', []);
  }

  var
    afField,
    afSubmit,
    expectRequiredErrorEvent,
    expectValidEvent,
    MESSAGE_TYPES,
    ngModel;

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

  describe('when the field should be validated on change', function () {
    beforeEach(function () {
      compile.call(this, 'change');
    });

    describe('and the user changes the field', function () {
      it('should validate the field as "valid" if it was initially valid', function () {
        this.element.field().val('other@address').trigger('input');
        expectValidEvent.call(this);
      });

      it('should validate the field and set the default (error) message if it was initially valid', function () {
        makeFieldEmpty.call(this);
        expectRequiredErrorEvent.call(this);
      });

      it('should validate the field and set the default (error) message if it was initially invalid', function () {
        this.element.field().val('email-invalid').trigger('input');
        makeFieldEmpty.call(this);
        expectRequiredErrorEvent.call(this);
      });

      it('should not validate the field on blur', function () {
        this.element.field().trigger('blur');
        expectNoValidEvent.call(this);
      });
    });
  });

  describe('when the field should be validated on blur', function () {
    beforeEach(function () {
      compile.call(this, 'blur');
    });

    describe('and the user changes the field without blurring', function () {
      it('should not validate the field', function () {
        this.element.field().val('other@address').trigger('input');
        expectNoValidEvent.call(this);
      });
    });

    describe('and the user blurs the field', function () {
      it('should validate the field', function () {
        this.element.field().trigger('blur');
        expectValidEvent.call(this);
      });
    });
  });

  describe('when the field should be validated on submit', function () {
    beforeEach(function () {
      compile.call(this, 'submit');
    });

    describe('and the user changes and blurs the field', function () {
      beforeEach(function () {
        this.element.field().val('other@address').trigger('input').trigger('blur');
      });

      it('should not validate the field', function () {
        expectNoValidEvent.call(this);
      });
    });
  });

  describe('when there are valid validators on the field and stored in $error', function () {
    // in 1.2 the validators that become valid set the value of $error.key to true, while it is deleted in 1.3
    // Since this test runs in 1.3, we have to set the $error object manually
    beforeEach(function () {
      compile.call(this);
      ngModel.$error.email = false;
      ngModel.$error.required = true;

      // Use the trigger value because that triggers the validation event without evaluating the ngModel
      this.$scope.triggerValue = 'changed';
      this.$scope.$digest();
    });

    it('should only broadcast messages in the validation event for valid validators', function () {
      expectRequiredErrorEvent.call(this);
    });
  });

  describe('when no triggerOn value is defined on the afSubmit directive and field', function () {
    beforeEach(function () {
      compile.call(this);
    });

    it('should use the value of AfMessageService.triggerOn() as default', function () {
      this.element.field().val('other@address').trigger('input');
      expectValidEvent.call(this);
    });
  });

  describe('when the field has a triggerOn attribute', function () {
    beforeEach(function () {
      compile.call(this, 'change', 'blur');
    });

    it('should override the triggerOn value of the afSubmit directive', function () {
      this.element.field().trigger('blur');
      expectValidEvent.call(this);
    });
  });

  describe('when the trigger value changes', function () {
    beforeEach(function () {
      compile.call(this);
      this.$scope.triggerValue = 'changed';
      this.$scope.$digest();
    });

    it('should validate the field', function () {
      expectValidEvent.call(this);
    });
  });

  describe('when a request for validation event is received', function () {

    // These are the same expectations as the case where the trigger is change and the model changes
    beforeEach(function () {
      compile.call(this);
      spyOn(ngModel, '$setValidity').and.callThrough();
      ngModel.$error = { required: true, other: true };
      this.$scope.$emit('validate');
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
        this.$scope.$emit('validate');
      });

      it('should validate the field in Angular 1.2', function () {
        expect(ngModel.$setViewValue).toHaveBeenCalledWith(ngModel.$viewValue);
      });
    });

    it('should send validation "valid" to the ngSubmitController', function () {
      expectValidEvent.call(this);
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      // Make field invalid to trigger a second validation event via the model watch
      makeFieldEmpty.call(this);
      expectRequiredErrorEvent.call(this);
    });
  });

  describe('when a setValidity event is received', function () {
    beforeEach(function () {
      compile.call(this);
      spyOn(ngModel, '$setValidity').and.callThrough();
    });

    describe('when it is addressed to this field', function () {
      beforeEach(function () {
        spyOn(afField, 'setMessageDetails').and.callThrough();
        // set isPristineAfterSubmit to true
        this.$scope.$broadcast('setValidity', 'userForm.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
      });

      it('should set the validity and message type for the field', function () {
        expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', false);
        expect(afField.setMessageDetails).toHaveBeenCalledWith('User name server side error', MESSAGE_TYPES[3]);
      });

      describe('and the user changes the field thereafter', function () {
        beforeEach(function () {
          ngModel.$setValidity.calls.reset();
          this.element.field().val('other@address').trigger('input');
        });

        it('should clear validation errors and do not a revalidation', function () {
          expect(ngModel.$setValidity).not.toHaveBeenCalledWith('User name server side error', false);
          expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', true);
          expect(ngModel.$setValidity).toHaveBeenCalledWith('Warning', true);
        });
      });

      describe('when the field in a subform with dynamic name', function () {
        beforeEach(function () {
          this.$scope.$emit.calls.reset();
          compileWithSubform.call(this);
        });

        it('should also process validity if there is an afField in a (sub)form with this name', function () {
          this.$scope.$broadcast('setValidity', 'subForm1.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
          expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', false);

          ngModel.$setValidity.calls.reset();

          this.$scope.$broadcast('setValidity', 'subFormNotExisting.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
          expect(ngModel.$setValidity).not.toHaveBeenCalledWith('User name server side error', false);
        });
      });
    });

    describe('when it is not addresses to this field', function () {
      beforeEach(function () {
        this.$scope.$broadcast('setValidity', 'user.other', [{ message: 'Warning', type: MESSAGE_TYPES[3] }]);
      });

      it('does nothing', function () {
        expect(ngModel.$setValidity).not.toHaveBeenCalled();
      });
    });
  });

  describe('when extra validation info is set in afField.$messages', function () {
    beforeEach(function () {
      compile.call(this);
    });

    it('should validate the field and set the default message with the type that has been set via afField methods', function () {
      afField.setErrorDetails('required');
      makeFieldEmpty.call(this);
      expect(this.$scope.$emit).toHaveBeenCalledWith('validation', 'user.email', [{ message: 'required', type: MESSAGE_TYPES[3] }]);

      afField.setWarningDetails('required');
      this.$scope.triggerValue = 'something-else';
      expectMessage.call(this, MESSAGE_TYPES[2]);

      afField.setInfoDetails('required');
      this.$scope.triggerValue = 'another-value';
      expectMessage.call(this, MESSAGE_TYPES[1]);

      afField.setSuccessDetails('required');
      this.$scope.triggerValue = 'trigger-again';
      expectMessage.call(this, MESSAGE_TYPES[0]);

      afField.setMessageDetails('required', MESSAGE_TYPES[3]);
      this.$scope.triggerValue = 'trigger';
      expectMessage.call(this, MESSAGE_TYPES[3]);
    });
  });

});
