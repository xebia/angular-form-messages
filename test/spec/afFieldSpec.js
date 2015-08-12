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

    $rootScope.$broadcast.calls.reset();
    // Setup spies on parent controllers
    afSubmit = element.controller('afSubmit');
    formCtrl = element.controller('form');
    ngModel = element.field().controller('ngModel');
    afField = element.field().controller('afField');
    spyOn(ngModel, '$validate');
  }

  function expectMessage(type) {
    $rootScope.$broadcast.calls.reset();
    this.$scope.$digest();
    expectEvent([{ message: 'required', type: type }], MESSAGE_TYPES[0]);
  }

  function expectEvent(messages, type) {
    expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', formCtrl, 'userForm.user.email', messages, type);
  }


  function expectNoValidEvent() {
    expect($rootScope.$broadcast).not.toHaveBeenCalledWith('validation', formCtrl, 'userForm.user.email', [], undefined);
  }

  var
    $rootScope,
    afField,
    afSubmit,
    expectErrorEvent,
    expectValidEvent,
    formCtrl,
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

    expectValidEvent = _.partial(expectEvent, [], undefined);
    expectErrorEvent = _.partial(expectEvent, [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
    $rootScope = mox.inject('$rootScope');
    spyOn($rootScope, '$broadcast').and.callThrough();
  });

  describe('when the field should be validated on change', function () {
    beforeEach(function () {
      compile('change');
    });

    describe('and the user changes the field', function () {
      it('should validate the field as "valid" if it was initially valid', function () {
        this.element.field().val('other@address').trigger('input');
        expectValidEvent();
      });

      it('should validate the field and set the default (error) message if it was initially valid', function () {
        makeFieldEmpty.call(this);
        expectErrorEvent();
      });

      it('should validate the field and set the default (error) message if it was initially invalid', function () {
        this.element.field().val('email-invalid').trigger('input');
        $rootScope.$broadcast.calls.reset();
        makeFieldEmpty.call(this);
        expectErrorEvent();
      });

      it('should not validate the field on blur', function () {
        this.element.field().trigger('blur');
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
        this.element.field().val('other@address').trigger('input');
        expectNoValidEvent();
      });
    });

    describe('and the user blurs the field', function () {
      it('should validate the field', function () {
        this.element.field().trigger('blur');
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
        this.element.field().val('other@address').trigger('input').trigger('blur');
      });

      it('should not validate the field', function () {
        expectNoValidEvent();
      });
    });
  });

  describe('when there are repeated fields', function () {
    // This test also passes when we do not use $interpolate, but it is necessary for angular 1.2
    beforeEach(function () {
      createScope({ user: {
        email: 'email@address',
        email2: undefined
      } });
      addSelectors(compileHtml('<form name="userForm" af-submit>' +
          '<div ng-form name="repeatForm{{$index}}" ng-repeat="field in user">' +
            '<input type="email" af-field name="user.email" ng-model="field" required />' +
          '</div>' +
        '</form>'), {
        ngForm: {
          selector: '[ng-form]:eq({0})',
          sub: {
            field: '[af-field]'
          }
        }
      });
    });

    it('should validate these as well', function () {
      var ngForm = this.element.ngForm(0);
      ngForm.field().val('').trigger('input');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', ngForm.controller('form'), 'repeatForm0.user.email', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('validation', this.element.ngForm(1).controller('form'), 'repeatForm1.user.email', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
    });
  });

  describe('when no triggerOn value is defined on the afSubmit directive and field', function () {
    beforeEach(function () {
      compile();
    });

    it('should use the value of AfMessageService.triggerOn() as default', function () {
      this.element.field().val('other@address').trigger('input');
      expectValidEvent();
    });
  });

  describe('when the field has a triggerOn attribute', function () {
    beforeEach(function () {
      compile('change', 'blur');
    });

    it('should override the triggerOn value of the afSubmit directive', function () {
      this.element.field().trigger('blur');
      expectValidEvent();
    });
  });

  describe('when the trigger value changes', function () {
    beforeEach(function () {
      compile();
      this.$scope.triggerValue = 'changed';
      this.$scope.$digest();
    });

    it('should validate the field', function () {
      expectValidEvent();
    });
  });

  describe('when a request for validation event is received', function () {

    // These are the same expectations as the case where the trigger is change and the model changes
    beforeEach(function () {
      compile();
      spyOn(ngModel, '$setValidity').and.callThrough();
      ngModel.$error = { required: true, other: true };
      $rootScope.$broadcast('validate');
    });

    it('should clear all current validations', function () {
      expect(ngModel.$setValidity).toHaveBeenCalledWith('required', true);
      expect(ngModel.$setValidity).toHaveBeenCalledWith('other', true);
    });

    it('should validate the field', function () {
      expect(ngModel.$validate).toHaveBeenCalled();
    });

    it('should send validation "valid" to the ngSubmitController', function () {
      expectValidEvent();
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      // Make field invalid to trigger a second validation event via the model watch
      makeFieldEmpty.call(this);
      expectErrorEvent();
    });
  });

  describe('when a setValidity event is received', function () {
    beforeEach(function () {
      compile();
      spyOn(ngModel, '$setValidity').and.callThrough();
    });

    describe('when it is addressed to this field', function () {
      beforeEach(function () {
        //afSubmit.triggerOn = 'change';
        spyOn(afField, 'setMessageDetails').and.callThrough();
        // set isPristineAfterSubmit to true
        $rootScope.$broadcast('setValidity', 'userForm.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
      });

      it('should set the validity and message type for the field', function () {
        expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', false);
        expect(afField.setMessageDetails).toHaveBeenCalledWith('User name server side error', MESSAGE_TYPES[3]);
      });

      it('should broadcast the validation events', function () {
        expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', this.element.controller('form'), 'userForm.user.email', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }], MESSAGE_TYPES[0]);
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
    });

    describe('when it is not addresses to this field', function () {
      beforeEach(function () {
        $rootScope.$broadcast('setValidity', 'userForm.user.other', [{ message: 'Warning', type: MESSAGE_TYPES[3] }]);
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
      makeFieldEmpty.call(this);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', this.element.controller('form'), 'userForm.user.email', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);

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
