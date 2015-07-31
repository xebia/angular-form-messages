describe('afField', function () {
  function makeFieldEmpty() {
    this.element.field().val('').trigger('input');
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
          MessageService: { determineMessageType: MESSAGE_TYPES[0] }
        };
      })
      .run();

    $rootScope = mox.inject('$rootScope');
    createScope({ user: { name: 'Misko' } });
    addSelectors(compileHtml('<form name="userForm" af-submit>' +
                  '<input af-field name="user.name" ng-model="user.name" af-trigger="triggerValue" required />' +
                '</form>', this.$scope), {
      field: '[af-field]'
    });

    // Setup spies on parent controllers
    afSubmit = this.element.controller('afSubmit');
    ngModel = this.element.field().controller('ngModel');
    afField = this.element.field().controller('afField');
    spyOn(ngModel, '$validate');
    spyOn($rootScope, '$broadcast').and.callThrough();
  });

  describe('when the form should be validated on change', function () {
    beforeEach(function () {
      afSubmit.triggerOn = 'change';
    });

    describe('and the user changes the field to an invalid value', function () {
      beforeEach(_.partial(makeFieldEmpty));

      it('should validate the field and set the default (error) message', function () {
        expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
      });
    });
  });

  describe('when the form should be validated on submit', function () {
    beforeEach(function () {
      afSubmit.triggerOn = 'submit';
    });

    describe('and the model changes', function () {
      beforeEach(_.partial(makeFieldEmpty));

      it('should not validate the field', function () {
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('validation');
      });
    });
  });

  describe('when the trigger value changes', function () {
    beforeEach(function () {
      this.$scope.triggerValue = 'changed';
      this.$scope.$digest();
    });

    it('should validate the field', function () {
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'userForm.user.name', [], MESSAGE_TYPES[0]);
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
