describe('afFieldState', function () {

  function sendValidation(fieldName, messages, messageType) {
    inj.$rootScope.$broadcast('validation', fieldName, messages, messageType);
    this.$scope.$digest();
  }

  function setup(messageType, messageCount, fieldName) {
    if (messageType) {
      this.element.removeClass('has-' + messageType.toLowerCase());
    }
    this.element.addClass(messageType === inj.MESSAGE_TYPES[3] ? 'has-warning has-info has-success' : 'has-error');

    var messages = _.map(_.range(messageCount), function (i) {
      return {
        message: 'Message ' + i,
        type: inj.MESSAGE_TYPES[i]
      };
    });
    sendValidation.call(this, fieldName, messages, messageType);
  }

  function checkMessageClass(className, invert) {
    var ex = expect(this.element);
    if (invert) {
      ex = ex.not;
    }
    ex.toHaveClass(className);
  }

  var
    inj,

    errorSetup = _.partial(setup, 'ERROR', 1),
    warningSetup = _.partial(setup, 'WARNING', 1),
    infoSetup = _.partial(setup, 'INFO', 1),
    successSetup = _.partial(setup, 'SUCCESS', 1),
    noMessageSetup = _.partial(setup, false, 0),
    successInfoSetup = _.partial(setup, false, 2),

    expectHasError = _.partial(checkMessageClass, 'has-error'),
    expectHasWarning = _.partial(checkMessageClass, 'has-warning'),
    expectHasInfo = _.partial(checkMessageClass, 'has-info'),
    expectHasSuccess = _.partial(checkMessageClass, 'has-success'),

    expectHasNoError = _.partial(checkMessageClass, 'has-error', true),
    expectHasNoWarning = _.partial(checkMessageClass, 'has-warning', true),
    expectHasNoInfo = _.partial(checkMessageClass, 'has-info', true),
    expectHasNoSuccess = _.partial(checkMessageClass, 'has-success', true);

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
    this.element = compileHtml('<form name="userForm" af-submit>' +
                                 '<div field-state="user.name"></div>' +
                               '</form>', this.$scope).find('[field-state]');
  });

  describe('when a validation event has been fired', function () {

    describe('when it is meant for the field wrap with the modelPath attached to the event', function () {

      function showSuccess(value) {
        this.element.parent().controller('afSubmit').showSuccess = value;
      }

      describe('when showSuccess is true on the afSubmit directive', function () {
        beforeEach(_.partial(showSuccess, true));

        describe('when the validation is "valid"', function () {
          beforeEach(_.partial(noMessageSetup, 'user.name'));

          it('should add the "has-success" class to the element', expectHasSuccess);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-info" class from the element', expectHasNoInfo);
        });

        describe('when the validation is "error"', function () {
          beforeEach(_.partial(errorSetup, 'user.name'));

          it('should add the "has-error" class to the element', expectHasError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-info" class from the element', expectHasNoInfo);
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
        });

        describe('when the validation is "warning"', function () {
          beforeEach(_.partial(warningSetup, 'user.name'));

          it('should add the "has-warning" class to the element', expectHasWarning);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-info" class from the element', expectHasNoInfo);
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
        });

        describe('when the validation is "info"', function () {
          beforeEach(_.partial(infoSetup, 'user.name'));

          it('should add the "has-info" class to the element', expectHasInfo);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
        });

        describe('when the validation is "success"', function () {
          beforeEach(_.partial(successSetup, 'user.name'));

          it('should add the "has-success" class to the element', expectHasSuccess);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-info" class from the element', expectHasNoInfo);
        });

        describe('when there are multiple validations', function () {
          beforeEach(_.partial(successInfoSetup, 'user.name'));

          it('should remove the "has-warning" class from the element', expectHasNoInfo);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
        });
      });

      describe('when showSuccess is false on the afSubmit directive', function () {
        beforeEach(_.partial(showSuccess, false));

        describe('when the validation is "valid"', function () {
          beforeEach(_.partial(noMessageSetup, 'user.name'));

          it('should not add the "has-success" class', expectHasNoSuccess);
        });

        describe('when the validation is "error"', function () {
          beforeEach(_.partial(errorSetup, 'user.name'));

          it('should add the "has-error" class', expectHasError);
          it('should remove the "has-success" class', expectHasNoSuccess);
          it('should remove the "has-info" class', expectHasNoInfo);
          it('should remove the "has-warning" class', expectHasNoWarning);
        });

        describe('when the validation is "success"', function () {
          beforeEach(_.partial(successSetup, 'user.name'));

          it('should add the "has-success" class', expectHasSuccess);
          it('should remove the "has-info" class', expectHasNoInfo);
          it('should remove the "has-warning" class', expectHasNoWarning);
          it('should remove the "has-error" class', expectHasNoError);
        });
      });
    });
  });
});
