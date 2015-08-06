describe('afField', function () {
  function makeFieldEmpty() {
    this.element.field().val('').trigger('input');
  }

  function compile(trigger, fieldTrigger) {
    var element = addSelectors(compileHtml(
      '<form name="userForm" af-submit ' + (trigger ? 'af-trigger-on="' + trigger + '"' : '') + '>' +
        '<input af-field name="user.name" ng-model="user.name" af-trigger="triggerValue"' + (fieldTrigger ? 'af-trigger-on="' + fieldTrigger + '"' : '') + ' required />' +
      '</form>',
      this.$scope
    ), {
      field: '[af-field]'
    });

    $rootScope.$broadcast.calls.reset();
    // Setup spies on parent controllers
    afSubmit = element.controller('afSubmit');
    ngModel = element.field().controller('ngModel');
    afField = element.field().controller('afField');
    spyOn(ngModel, '$validate');
  }

  function expectValidEvent() {
    expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [], MESSAGE_TYPES[0]);
  }

  function expectErrorEvent() {
    expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
  }

  var
    $rootScope,
    afField,
    afSubmit,
    MESSAGE_TYPES,
    ngModel;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices('MessageService')
      .setupResults(function () {
        MESSAGE_TYPES = mox.inject('MESSAGE_TYPES');
        return {
          MessageService: {
            determineMessageType: MESSAGE_TYPES[0],
            triggerOn: 'change'
          }
        };
      })
      .run();

    $rootScope = mox.inject('$rootScope');
    spyOn($rootScope, '$broadcast').and.callThrough();
    createScope({ user: { name: 'Misko' } });
    compile('change');
  });

  describe('when the field should be validated on change', function () {
    beforeEach(function () {
      compile('change');
    });

    describe('and the user changes the field', function () {
      it('should validate the field as "valid"', function () {
        this.element.field().val('another valid value').trigger('input');
        expectValidEvent();
      });

      it('should validate the field and set the default (error) message', function () {
        makeFieldEmpty.call(this);
        expectErrorEvent();
      });

      it('should not validate the field on blur', function () {
        this.element.field().trigger('blur');
        expect($rootScope.$broadcast).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the field should be validated on blur', function () {
    beforeEach(function () {
      compile('blur');
    });

    describe('and the user changes the field without blurring', function () {
      it('should not validate the field', function () {
        this.element.field().val('new value').trigger('input');
        expect($rootScope.$broadcast).not.toHaveBeenCalled();
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
        this.element.field().val('').trigger('input').trigger('blur');
      });

      it('should not validate the field', function () {
        expect($rootScope.$broadcast).not.toHaveBeenCalled();
      });
    });
  });

  describe('when no triggerOn value is defined on the afSubmit directive and field', function () {
    beforeEach(function () {
      compile();
    });

    it('should use the value of MessageService.triggerOn() as default', function () {
      this.element.field().val('new value').trigger('input');
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
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [], MESSAGE_TYPES[0]);
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      // Make field invalid to trigger a second validation event via the model watch
      makeFieldEmpty.call(this);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
    });
  });

  describe('when a setValidity event is received', function () {
    beforeEach(function () {
      spyOn(ngModel, '$setValidity').and.callThrough();
    });

    describe('when it is addressed to this field', function () {
      beforeEach(function () {
        spyOn(afField, 'setMessageDetails').and.callThrough();
        // set isPristineAfterSubmit to true
        $rootScope.$broadcast('setValidity', 'userForm.user.name', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }]);
      });

      it('should set the validity and message type for the field', function () {
        expect(ngModel.$setValidity).toHaveBeenCalledWith('User name server side error', false);
        expect(afField.setMessageDetails).toHaveBeenCalledWith('User name server side error', MESSAGE_TYPES[3]);
      });

      it('should broadcast the validation events', function () {
        expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [{ message: 'User name server side error', type: MESSAGE_TYPES[3] }, { message: 'Warning', type: MESSAGE_TYPES[2] }], MESSAGE_TYPES[0]);
      });

      describe('and the user changes the field thereafter', function () {
        beforeEach(function () {
          ngModel.$setValidity.calls.reset();
          this.element.field().val('make valid').trigger('input');
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
    function expectMessage(type) {
      $rootScope.$broadcast.calls.reset();
      this.$scope.$digest();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [{ message: 'required', type: type }], MESSAGE_TYPES[0]);
    }

    it('should validate the field and set the default message with the type that has been set via afField methods', function () {
      afField.setErrorDetails('required');
      makeFieldEmpty.call(this);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);

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
