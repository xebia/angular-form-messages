describe('afFieldState', function () {
  var
    $scope,
    element;

  function setup(messageTypes, fieldName) {
    // Add messages
    $scope.messages = _.map(messageTypes, function (type) {
      return type === inj.MESSAGE_TYPES[3] ? 'danger' : type.toLowerCase();
    });
    $scope.$digest();

    // Add 'has-...' classes that will be removed by the directive
    var fieldState = element.fieldState();
    fieldState.addClass('has-warning has-info has-success has-error');
    if (messageTypes.length) {
      _.each(messageTypes, function (messageType) {
        fieldState.removeClass('has-' + messageType.toLowerCase());
      });
    } else {
      fieldState.removeClass('has-success');
    }

    // Send the validation event to trigger the directive
    validate(fieldName);
  }

  function validate(fieldName, messages) {
    $scope.$emit('validation', fieldName || 'user.name', messages || []);
    $scope.$digest();
    inj.$timeout.flush();
  }

  function checkMessageClass(className, invert) {
    var ex = expect(element.fieldState());
    if (invert) {
      ex = ex.not;
    }
    ex.toHaveClass('has-' + className);
  }

  var
    inj,

    expectHasNoError = _.partial(checkMessageClass, 'error', true),
    expectHasNoWarning = _.partial(checkMessageClass, 'warning', true),
    expectHasNoInfo = _.partial(checkMessageClass, 'info', true),
    expectHasNoSuccess = _.partial(checkMessageClass, 'success', true);

  beforeEach(function () {
    mox
      .module('angularFormMessagesBootstrap')
      .mockServices('AfMessageService')
      .setupResults(function () {
        return {
          AfMessageService: {
            getMostSevereMessage: function (messages) { return messages[0]; }
          }
        };
      })
      .run();

    inj = mox.inject('$rootScope', '$timeout', 'MESSAGE_TYPES');
    $scope = createScope();
    element = addSelectors(compileHtml('<form name="userForm" af-submit><div af-field-state="user.name">' +
                             '<div class="alert alert-{{message}}" ng-repeat="message in messages"></div>' +
                             '</div></form>'), {
      fieldState: '[af-field-state]'
    });
  });

  describe('when a validation event has been fired', function () {

    function showSuccess(value) {
      element.controller('afSubmit').showSuccess = value;
    }

    describe('when the fieldName is passed via the fieldName attribute', function () {
      beforeEach(function () {
        addSelectors(compileHtml('<form name="userForm" af-submit><div af-field-state af-field-name="user.name"></div></form>'), {
          fieldState: '[af-field-state]'
        });
        validate('user.name', [{ type: inj.MESSAGE_TYPES[3] }]);
      });

      it('should add the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
    });

    describe('when showSuccess is true on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, true));

      describe('when there is no message', function () {
        beforeEach(_.partial(setup, []));

        it('should add the "has-success" class to the element', _.partial(checkMessageClass, 'success'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);

        describe('when there is another validation event for another fieldName', function () {
          beforeEach(function () {
            validate('user.other', [{ type: inj.MESSAGE_TYPES[3] }]);
          });
          it('should not remove the "has-success" class from the element', _.partial(checkMessageClass, 'success'));
        });

        describe('when there is another validation event for the same fieldName', function () {
          beforeEach(function () {
            validate('user.name', [{ type: inj.MESSAGE_TYPES[3] }]);
          });
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
          it('should add the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
        });
      });

      describe('when there is an "error" message', function () {
        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[3]]);
        });

        it('should add the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);

        // This block of course also applies to the other message types
        describe('when there is another validation event for the same fieldName', function () {
          beforeEach(function () {
            validate('user.name', [{ type: inj.MESSAGE_TYPES[2] }]);
          });

          // Message is ignored since there are still afMessages in the DOM
          it('should keep the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
          it('should not add the "has-warning" class to the element', expectHasNoWarning);

          describe('and the messages are gone', function () {
            beforeEach(function () {
              $scope.messages = [];
              validate('user.name', [{ type: inj.MESSAGE_TYPES[2] }]);
            });
            it('should remove the "has-error" class from the element', expectHasNoError);
            it('should not add the "warning" class to the element', _.partial(checkMessageClass, 'warning'));
          });
        });
      });

      describe('when there is a "warning" message', function () {
        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[2]]);
        });

        it('should add the "has-warning" class to the element', _.partial(checkMessageClass, 'warning'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when there is an "info" message', function () {
        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[1]]);
        });

        it('should add the "has-info" class to the element', _.partial(checkMessageClass, 'info'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when there is a "success" message', function () {
        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[0]]);
        });

        it('should add the "has-success" class to the element', _.partial(checkMessageClass, 'success'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
      });

      describe('when there is no message for another fieldName', function () {
        beforeEach(function () {
          setup([], 'user.other');
        });
        it('should not add the "has-success" class to the element', expectHasNoSuccess);
      });

      describe('when there are multiple messages', function () {

        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[1], inj.MESSAGE_TYPES[0]]);
        });

        it('should remove the "has-warning" class from the element', expectHasNoInfo);
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);

      });
    });

    describe('when showSuccess is false on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, false));

      describe('when there are no messages', function () {
        beforeEach(_.partial(setup, []));

        it('should not add the "has-error" class', expectHasNoError);
        it('should not add the "has-warning" class', expectHasNoWarning);
        it('should not add the "has-info" class', expectHasNoInfo);
        it('should not add the "has-success" class', expectHasNoSuccess);
      });

      describe('when there is an "error" message', function () {
        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[3]]);
        });

        it('should add the "has-error" class', _.partial(checkMessageClass, 'error'));
        it('should remove the "has-success" class', expectHasNoSuccess);
        it('should remove the "has-info" class', expectHasNoInfo);
        it('should remove the "has-warning" class', expectHasNoWarning);
      });

      describe('when there is a "success" message', function () {
        beforeEach(function () {
          setup([inj.MESSAGE_TYPES[0]]);
        });

        it('should add the "has-success" class', _.partial(checkMessageClass, 'success'));
        it('should remove the "has-info" class', expectHasNoInfo);
        it('should remove the "has-warning" class', expectHasNoWarning);
        it('should remove the "has-error" class', expectHasNoError);
      });
    });
  });
});
