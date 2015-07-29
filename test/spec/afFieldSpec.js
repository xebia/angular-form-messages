describe('afField', function () {
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
    compileHtml('<form name="userForm" af-submit>' +
                  '<input af-field name="user.name" ng-model="user.name" af-trigger="triggerValue" required />' +
                '</form>', this.$scope);

    // Setup spies on parent controllers
    afSubmit = this.element.controller('afSubmit');
    ngModel = this.element.find('[af-field]').controller('ngModel');
    afField = this.element.find('[af-field]').controller('afField');
    spyOn(ngModel, '$validate');
    spyOn($rootScope, '$broadcast').and.callThrough();
  });

  describe('when the form should be validated on change', function () {
    beforeEach(function () {
      afSubmit.triggerOn = 'change';
    });

    describe('and the user changes the field to an invalid value', function () {
      beforeEach(function () {
        ngModel.$setViewValue('');
      });

      it('should validate the field and set the default (error) message', function () {
        expect(ngModel.$validate).toHaveBeenCalled();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
      });
    });
  });

  describe('when the form should be validated on submit', function () {
    beforeEach(function () {
      afSubmit.triggerOn = 'submit';
    });

    describe('and the model changes', function () {
      beforeEach(function () {
        ngModel.$setViewValue('');
        this.$scope.$digest();
      });

      it('should not validate the field', function () {
        expect(ngModel.$validate).not.toHaveBeenCalled();
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('validation');
      });
    });

    describe('and the user changes the field', function () {
      beforeEach(function () {
        ngModel.$setViewValue(''); // this would normally make the field invalid 'required'
      });

      it('should clear validation errors and do not a revalidation', function () {
        expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', []);
      });
    });
  });

  describe('when the trigger value changes', function () {
    beforeEach(function () {
      this.$scope.triggerValue = 'changed';
      this.$scope.$digest();
    });

    it('should validate the field', function () {
      expect(ngModel.$validate).toHaveBeenCalled();
    });
  });

  describe('when a request for validation event is fired', function () {

    // These are the same expectations as the case where the trigger is change and the model changes
    beforeEach(function () {
      $rootScope.$broadcast('validate');
    });

    it('should validate the field', function () {
      expect(ngModel.$validate).toHaveBeenCalled();
    });

    it('should send validation "valid" to the ngSubmitController', function () {
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', [], MESSAGE_TYPES[0]);
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      // Make field invalid to trigger a second validation event via the model watch
      ngModel.$setViewValue('');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
    });
  });

  describe('when extra validation info is set in afField.$messages', function () {
    function expectMessage(type) {
      $rootScope.$broadcast.calls.reset();
      this.$scope.$digest();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', [{ message: 'required', type: type }], MESSAGE_TYPES[0]);
    }

    it('should validate the field and set the default message with the type that has been set via afField methods', function () {
      afField.setError('required');
      ngModel.$setViewValue('');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('validation', 'user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);

      afField.setWarning('required');
      this.$scope.triggerValue = 'something-else';
      expectMessage.call(this, MESSAGE_TYPES[2]);

      afField.setInfo('required');
      this.$scope.triggerValue = 'another-value';
      expectMessage.call(this, MESSAGE_TYPES[1]);

      afField.setSuccess('required');
      this.$scope.triggerValue = 'trigger-again';
      expectMessage.call(this, MESSAGE_TYPES[0]);
    });
  });

});
