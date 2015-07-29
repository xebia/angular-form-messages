describe('afFeedback', function () {

  function sendValidation(fieldName, messages) {
    inj.$rootScope.$broadcast('validation', fieldName, messages);
    this.$scope.$digest();
  }

  function setup(messageType, messageCount, fieldName) {
    this.element.feedback()[(messageType ? 'remove' : 'add') + 'Class']('has-feedback');

    var messages = _.map(_.range(messageCount), function (i) {
      return {
        message: 'Message ' + i,
        type: inj.MESSAGE_TYPES[i]
      };
    });
    sendValidation.call(this, fieldName, messages);
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
      .mockServices('MessageService')
      .setupResults(function () {
        return {
          MessageService: {
            validation: function (messageId, callback) {
              // This method is quite hard to mock, so we mimic the implementation, except for the messageId condition
              mox.inject('$rootScope').$on('validation', function (event, validationMessageId, messages, messageType) {
                callback(messages, messageType);
              });
            }
          }
        };
      })
      .run();

    inj = mox.inject('$rootScope', 'MESSAGE_TYPES');
    createScope();
    addSelectors(compileHtml('<form af-submit><div af-feedback="user.name"></div></form>'), {
      feedback: '[af-feedback]'
    });
  });

  describe('when a validation event has been fired', function () {

    function showSuccess(value) {
      this.element.controller('afSubmit').showSuccess = value;
    }

    it('should register the validation event listener via the MessageService', function () {
      expect(mox.get.MessageService.validation).toHaveBeenCalledWith('user.name', jasmine.any(Function));
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        mox.get.MessageService.validation.calls.reset();
        compileHtml('<form af-submit><div af-feedback af-message-id="user.name"></div></form>');
      });

      it('should register the validation event listener via the MessageService', function () {
        expect(mox.get.MessageService.validation).toHaveBeenCalledWith('user.name', jasmine.any(Function));
      });
    });

    describe('when showSuccess is true on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, true));

      describe('when the validation is "valid"', function () {
        beforeEach(_.partial(noMessageSetup, 'user.name'));

        it('should add the "has-feedback" class to the element"', expectHasFeedback);
      });

      describe('when the validation is "error"', function () {
        beforeEach(_.partial(errorSetup, 'user.name'));

        it('should add the "has-feedback" class to the element"', expectHasFeedback);
      });

      describe('when there are multiple validations', function () {
        beforeEach(_.partial(successInfoSetup, 'user.name'));

        it('should add the "has-feedback" class to the element"', expectHasFeedback);
      });
    });

    describe('when showSuccess is false on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, false));

      describe('when the validation is "valid"', function () {
        beforeEach(_.partial(noMessageSetup, 'user.name'));

        it('should remove the "has-feedback" class', expectHasNoFeedback);
      });

      describe('when the validation is "error"', function () {
        beforeEach(_.partial(errorSetup, 'user.name'));

        it('should add the "has-feedback" class', expectHasFeedback);
      });

      describe('when there are multiple validations', function () {
        beforeEach(_.partial(successInfoSetup, 'user.name'));

        it('should add the "has-feedback" class', expectHasFeedback);
      });
    });
  });
});
