describe('afField', function () {
  var ngModel, submit;

  beforeEach(function () {
    mox
      .module('angularFormMessages', 'templates/error.html')
      .run();

    createScope({ user: { name: 'Misko' } });
    compileHtml('<form name="userForm" af-submit><div af-field-wrap af-model-path="user.name"><div af-error></div><input af-field name="name" ng-model="user.name" required /></div></form>', this.$scope);

    // Setup spies on parent controllers
    submit = this.element.controller('afSubmit');
    ngModel = this.element.find('[af-field]').controller('ngModel');
    spyOn(submit, 'validate');
    spyOn(ngModel, '$validate');
  });

  // TODO restructure tests, group by validation trigger, then by event

  describe('when a request for validation event is fired', function () {

    beforeEach(inject(function ($rootScope) {
      $rootScope.$broadcast('validate');
    }));

    it('should validate the form model', function () {
      expect(ngModel.$validate).toHaveBeenCalled();
    });

    it('should send validation "valid" to the ngSubmitController', function () {
      expect(submit.validate).toHaveBeenCalledWith('user.name', true, '');
    });

    it('should send validation "invalid" to the ngSubmitController', function () {
      this.$scope.user.name = '';
      this.$scope.$digest();
      expect(submit.validate).toHaveBeenCalledWith('user.name', false, 'required');
    });
  });

  describe('when the model changes', function () {
    beforeEach(function () {
      this.$scope.user.name = '';
    });

    describe('when the form should be validated on model change', function () {
      beforeEach(function () {
        submit.trigger = 'change';
      });

      it('should validate', function () {
        this.$scope.$digest();
        expect(ngModel.$validate).toHaveBeenCalled();
      });
    });

    describe('when the form should not be validated on model change', function () {
      beforeEach(function () {
        submit.trigger = 'not-change';
      });

      it('should not validate', function () {
        this.$scope.$digest();
        expect(ngModel.$validate).not.toHaveBeenCalled();
      });
    });

  });

  describe('when the user changes the field', function () {

    describe('when the form should be validated on submit', function () {
      beforeEach(function () {
        submit.trigger = 'submit';
        this.element.find('[af-field]').val('').trigger('change'); // this would normally make the field invalid 'required'
      });

      it('should clear validation errors', function () {
        expect(submit.validate).toHaveBeenCalledWith('user.name', true, '');
      });
    });

    describe('when the form also should be validated when validation trigger is not submit', function () {
      beforeEach(function () {
        submit.trigger = 'change';
        this.element.find('[af-field]').val('other value').trigger('change');
      });

      it('should clear validation errors', function () {
        expect(submit.validate).not.toHaveBeenCalled();
      });
    });

  });
});
