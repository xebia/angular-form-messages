describe('afField', function () {
  var
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

    createScope({ user: { name: 'Misko' } });
    compileHtml('<form name="userForm" af-submit>' +
                  '<div af-field-wrap="user.name">' +
                    '<input af-field name="name" ng-model="user.name" af-trigger="triggerValue" required />' +
                  '</div>' +
                '</form>', this.$scope);

    // Setup spies on parent controllers
    afSubmit = this.element.controller('afSubmit');
    ngModel = this.element.find('[af-field]').controller('ngModel');
    afField = this.element.find('[af-field]').controller('afField');
    spyOn(afSubmit, 'validate');
    spyOn(ngModel, '$validate');
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
        expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
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
        expect(afSubmit.validate).not.toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
      });
    });

    describe('and the user changes the field', function () {
      beforeEach(function () {
        ngModel.$setViewValue(''); // this would normally make the field invalid 'required'
      });

      it('should clear validation errors and do not a revalidation', function () {
        expect(afSubmit.validate).toHaveBeenCalledWith('user.name', []);
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

    // These are the same expectation as the case where the trigger is change and the model changes
    beforeEach(inject(function ($rootScope) {
      $rootScope.$broadcast('validate');
    }));

    it('should validate the field', function () {
      expect(ngModel.$validate).toHaveBeenCalled();
    });

    it('should send validation "valid" to the ngSubmitController', function () {
      expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [], MESSAGE_TYPES[0]);
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      afSubmit.validate.calls.reset();
      // Make field invalid to trigger a second validation event via the model watch
      ngModel.$setViewValue('');
      expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);
    });
  });

  describe('when extra validation info is set in afField.$messages', function () {
    it('should validate the field and set the default message with the type that has been set via afField methods', function () {
      afField.setError('required');
      ngModel.$setViewValue('');
      expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[3] }], MESSAGE_TYPES[0]);

      afField.setWarning('required');
      this.$scope.triggerValue = 'something-else';
      this.$scope.$digest();
      expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[2] }], MESSAGE_TYPES[0]);

      afField.setInfo('required');
      this.$scope.triggerValue = 'another-value';
      this.$scope.$digest();
      expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[1] }], MESSAGE_TYPES[0]);

      afField.setSuccess('required');
      this.$scope.triggerValue = 'trigger-again';
      this.$scope.$digest();
      expect(afSubmit.validate).toHaveBeenCalledWith('user.name', [{ message: 'required', type: MESSAGE_TYPES[0] }], MESSAGE_TYPES[0]);
    });
  });

});
