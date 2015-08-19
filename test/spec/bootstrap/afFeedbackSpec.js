describe('afFeedback', function () {

  function setup(messageType, messageCount) {
    this.element.feedback()[(messageType ? 'remove' : 'add') + 'Class']('has-feedback');

    var messages = _.map(_.range(messageCount), function (i) {
      return {
        message: 'Message ' + i,
        type: inj.MESSAGE_TYPES[i]
      };
    });

    this.$scope.$emit('validation', undefined, messages);
    this.$scope.$digest();
  }

  function checkMessageClass(className, invert) {
    var ex = expect(this.element.feedback());
    if (invert) {
      ex = ex.not;
    }
    ex.toHaveClass(className);
  }

  var
    inj,

    noMessageSetup = _.partial(setup, false, 0),
    errorSetup = _.partial(setup, 'ERROR', 1),
    successInfoSetup = _.partial(setup, false, 2),

    expectHasFeedback = _.partial(checkMessageClass, 'has-feedback'),
    expectHasNoFeedback = _.partial(checkMessageClass, 'has-feedback', true);

  beforeEach(function () {
    mox
      .module('angularFormMessagesBootstrap')
      .mockServices('AfMessageService')
      .setupResults(function () {
        return {
          AfMessageService: {
            validation: function ($scope, fieldName, callback) {
              // This method is quite hard to mock, so we mimic the implementation, except for the fieldName condition
              $scope.$on('validation', function (event, validationFieldName, messages, messageType) {
                callback(validationFieldName, messages, messageType);
              });
            }
          }
        };
      })
      .run();

    inj = mox.inject('$rootScope', 'MESSAGE_TYPES');
    createScope();
    addSelectors(compileHtml('<form name="userForm" af-submit><div af-feedback="user.name"></div></form>'), {
      feedback: '[af-feedback]'
    });
  });

  describe('when a validation event has been fired', function () {

    function showSuccess(value) {
      this.element.controller('afSubmit').showSuccess = value;
    }

    it('should register the validation event listener via the AfMessageService', function () {
      expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith(this.$scope, 'user.name', jasmine.any(Function));
    });

    describe('when the fieldName is passed via the fieldName attribute', function () {
      beforeEach(function () {
        mox.get.AfMessageService.validation.calls.reset();
        compileHtml('<form name="userForm" af-submit><div af-feedback af-field-name="user.name"></div></form>');
      });

      it('should register the validation event listener via the AfMessageService', function () {
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith(this.$scope, 'user.name', jasmine.any(Function));
      });
    });

    describe('when showSuccess is true on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, true));

      describe('when the validation is "valid"', function () {
        beforeEach(noMessageSetup);

        it('should add the "has-feedback" class to the element"', expectHasFeedback);
      });

      describe('when the validation is "error"', function () {
        beforeEach(errorSetup);

        it('should add the "has-feedback" class to the element"', expectHasFeedback);
      });

      describe('when there are multiple validations', function () {
        beforeEach(successInfoSetup);

        it('should add the "has-feedback" class to the element"', expectHasFeedback);
      });
    });

    describe('when showSuccess is false on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, false));

      describe('when the validation is "valid"', function () {
        beforeEach(noMessageSetup);

        it('should remove the "has-feedback" class', expectHasNoFeedback);
      });

      describe('when the validation is "error"', function () {
        beforeEach(errorSetup);

        it('should add the "has-feedback" class', expectHasFeedback);
      });

      describe('when there are multiple validations', function () {
        beforeEach(successInfoSetup);

        it('should add the "has-feedback" class', expectHasFeedback);
      });
    });
  });
});
