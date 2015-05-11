describe('afField', function () {
  var ngModel, submit;

  beforeEach(function () {
    mox
      .module('angularFormMessages', 'templates/error.html')
      .run();

    createScope({ user: { name: 'Misko' } });
    compileHtml('<form name="userForm" af-submit><div af-field-wrap="user.name"><div af-error></div><input af-field name="name" ng-model="user.name" required /></div></form>', this.$scope);

    // Setup spies on parent controllers
    submit = this.element.controller('afSubmit');
    ngModel = this.element.find('[af-field]').controller('ngModel');
    spyOn(submit, 'validate');
    spyOn(ngModel, '$validate');
  });

  describe('when the form should be validated on change', function () {
    beforeEach(function () {
      submit.trigger = 'change';
    });

    describe('and the model changes', function () {
      beforeEach(function () {
        this.$scope.user.name = '';
        this.$scope.$digest();
      });

      it('should validate the form', function () {
        expect(ngModel.$validate).toHaveBeenCalled();
        expect(submit.validate).toHaveBeenCalledWith('user.name', ['required']);
      });
    });

    describe('and the user changes the field', function () {
      beforeEach(function () {
        submit.validate.calls.reset();
        this.element.find('[af-field]').val('').trigger('change');
      });

      it('should revalidate the form', function () {
        expect(submit.validate).toHaveBeenCalledWith('user.name', ['required']);
      });

    });
  });

  describe('when the form should be validated on submit', function () {
    beforeEach(function () {
      submit.trigger = 'submit';
    });

    describe('and the model changes', function () {
      beforeEach(function () {
        this.$scope.user.name = '';
        this.$scope.$digest();
      });

      it('should not validate the form', function () {
        expect(ngModel.$validate).not.toHaveBeenCalled();
        expect(submit.validate).not.toHaveBeenCalledWith('user.name', ['required']);
      });
    });

    describe('and the user changes the field', function () {

      beforeEach(function () {
        submit.validate.calls.reset();
        this.element.find('[af-field]').val('').trigger('change'); // this would normally make the field invalid 'required'
      });

      it('should clear validation errors and do not a revalidation', function () {
        expect(submit.validate).toHaveBeenCalledWith('user.name', []);
      });

    });
  });

  describe('when a request for validation event is fired', function () {

    // These are the same expectation as the case where the trigger is change and the model changes
    beforeEach(inject(function ($rootScope) {
      $rootScope.$broadcast('validate');
    }));

    it('should validate the form model', function () {
      expect(ngModel.$validate).toHaveBeenCalled();
    });

    it('should send validation "valid" to the ngSubmitController', function () {
      expect(submit.validate).toHaveBeenCalledWith('user.name', []);
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      submit.validate.calls.reset();
      // Make field invalid to trigger a second validation event via the model watch
      this.$scope.user.name = '';
      this.$scope.$digest();

      expect(submit.validate).toHaveBeenCalledWith('user.name', ['required']);
    });
  });

});
