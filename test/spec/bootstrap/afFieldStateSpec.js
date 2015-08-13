describe('afFieldState', function () {

  function setup(messageType, messageCount) {
    if (messageType) {
      this.element.fieldState().removeClass('has-' + messageType.toLowerCase());
    }
    this.element.fieldState().addClass(messageType === inj.MESSAGE_TYPES[3] ? 'has-warning has-info has-success' : 'has-error');

    var messages = _.map(_.range(messageCount), function (i) {
      return {
        message: 'Message ' + i,
        type: inj.MESSAGE_TYPES[i]
      };
    });

    // The messageId is not checked because that is mocked away, so can be undefined
    inj.$rootScope.$broadcast('validation', undefined, messages, messageType);
    this.$scope.$digest();
  }

  function checkMessageClass(className, invert) {
    var ex = expect(this.element.fieldState());
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
    successInfoSetup = _.partial(setup, 'INFO', 2),

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
      .mockServices('AfMessageService')
      .setupResults(function () {
        return {
          AfMessageService: {
            showMultiple: true,
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
    addSelectors(compileHtml('<form name="userForm" af-submit><div af-field-state="user.name"></div></form>'), {
      fieldState: '[af-field-state]'
    });
  });

  describe('when a validation event has been fired', function () {

    function showSuccess(value) {
      this.element.controller('afSubmit').showSuccess = value;
    }

    it('should register the validation event listener via the AfMessageService', function () {
      expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith('userForm.user.name', jasmine.any(Function));
    });

    describe('when the fieldState is in a form with dynamic name', function () {
      beforeEach(function () {
        mox.get.AfMessageService.validation.calls.reset();
        compileHtml('<form name="userForm" af-submit>' +
                      '<div ng-form name="subForm{{$index}}" ng-repeat="messageId in [0, 1]">' +
                        '<div af-field-state="user.name"></div>' +
                      '</div>' +
                    '</form>');
      });

      it('should register the validation event listener via the AfMessageService with the interpolated form name in the messageId', function () {
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith('subForm0.user.name', jasmine.any(Function));
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith('subForm1.user.name', jasmine.any(Function));
      });
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        mox.get.AfMessageService.validation.calls.reset();
        compileHtml('<form name="userForm" af-submit><div af-field-state af-message-id="user.name"></div></form>');
      });

      it('should register the validation event listener via the AfMessageService', function () {
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith('userForm.user.name', jasmine.any(Function));
      });
    });

    describe('when showSuccess is true on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, true));

      describe('when the validation is "valid"', function () {
        beforeEach(noMessageSetup);

        it('should add the "has-success" class to the element', expectHasSuccess);
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
      });

      describe('when the validation is "error"', function () {
        beforeEach(errorSetup);

        it('should add the "has-error" class to the element', expectHasError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when the validation is "warning"', function () {
        beforeEach(warningSetup);

        it('should add the "has-warning" class to the element', expectHasWarning);
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when the validation is "info"', function () {
        beforeEach(infoSetup);

        it('should add the "has-info" class to the element', expectHasInfo);
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when the validation is "success"', function () {
        beforeEach(successSetup);

        it('should add the "has-success" class to the element', expectHasSuccess);
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
      });

      describe('when there are multiple validations', function () {

        describe('when we allow to show multiple messages', function () {

          beforeEach(function () {
            mox.get.AfMessageService.showMultiple.and.returnValue(true);
            successInfoSetup.call(this);
          });

          it('should remove the "has-warning" class from the element', expectHasNoInfo);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
        });

        describe('when we allow only the message with the highest severity', function () {
          beforeEach(function () {
            mox.get.AfMessageService.showMultiple.and.returnValue(false);
            successInfoSetup.call(this);
          });

          it('should add the "has-info" class to the element', expectHasInfo);
          it('should remove the "has-error" class from the element', expectHasNoError);
          it('should remove the "has-warning" class from the element', expectHasNoWarning);
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
        });
      });
    });

    describe('when showSuccess is false on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, false));

      describe('when the validation is "valid"', function () {
        beforeEach(noMessageSetup);

        it('should not add the "has-success" class', expectHasNoSuccess);
      });

      describe('when the validation is "error"', function () {
        beforeEach(errorSetup);

        it('should add the "has-error" class', expectHasError);
        it('should remove the "has-success" class', expectHasNoSuccess);
        it('should remove the "has-info" class', expectHasNoInfo);
        it('should remove the "has-warning" class', expectHasNoWarning);
      });

      describe('when the validation is "success"', function () {
        beforeEach(successSetup);

        it('should add the "has-success" class', expectHasSuccess);
        it('should remove the "has-info" class', expectHasNoInfo);
        it('should remove the "has-warning" class', expectHasNoWarning);
        it('should remove the "has-error" class', expectHasNoError);
      });
    });
  });
});
