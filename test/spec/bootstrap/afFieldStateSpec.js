describe('afFieldState', function () {

  function setup(messageTypes) {
    // Add messages
    this.$scope.messages = _.map(messageTypes, function (type) {
      return type === inj.MESSAGE_TYPES[3] ? 'danger' : type.toLowerCase();
    });
    this.$scope.$digest();

    // Add 'has-...' classes that will be removed by the directive
    var fieldState = this.element.fieldState();
    fieldState.addClass('has-warning has-info has-success has-error');
    if (messageTypes.length) {
      _.each(messageTypes, function (messageType) {
        fieldState.removeClass('has-' + messageType.toLowerCase());
      });
    } else {
      fieldState.removeClass('has-success');
    }

    // Send the validation event to trigger the directive
    validate.call(this);
  }

  function validate(messageId, messages) {
    this.$scope.$emit('validation', messageId || 'user.name', messages || []);
    this.$scope.$digest();
    inj.$timeout.flush();
  }

  function checkMessageClass(className, invert) {
    var ex = expect(this.element.fieldState());
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
      .run();

    inj = mox.inject('$rootScope', '$timeout', 'MESSAGE_TYPES');
    createScope();
    addSelectors(compileHtml('<form name="userForm" af-submit><div af-field-state="user.name">' +
                             '<div class="alert alert-{{message}}" ng-repeat="message in messages"></div>' +
                             '</div></form>'), {
      fieldState: '[af-field-state]'
    });
  });

  describe('when a validation event has been fired', function () {

    function showSuccess(value) {
      this.element.controller('afSubmit').showSuccess = value;
    }

    describe('when showSuccess is true on the afSubmit directive', function () {
      beforeEach(_.partial(showSuccess, true));

      describe('when there is no message', function () {
        beforeEach(_.partial(setup, []));

        it('should add the "has-success" class to the element', _.partial(checkMessageClass, 'success'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);

        describe('when there is another validation event for another messageId', function () {
          beforeEach(function () {
            validate.call(this, 'user.other', [{ type: inj.MESSAGE_TYPES[3] }]);
          });
          it('should not remove the "has-success" class from the element', _.partial(checkMessageClass, 'success'));
        });

        describe('when there is another validation event for the same messageId', function () {
          beforeEach(function () {
            validate.call(this, 'user.name', [{ type: inj.MESSAGE_TYPES[3] }]);
          });
          it('should remove the "has-success" class from the element', expectHasNoSuccess);
          it('should add the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
        });
      });

      describe('when there is an "error" message', function () {
        beforeEach(function () {
          setup.call(this, [inj.MESSAGE_TYPES[3]]);
        });

        it('should add the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);

        // This block of course also applies to the other message types
        describe('when there is another validation event for the same messageId', function () {
          beforeEach(function () {
            validate.call(this, 'user.name', [{ type: inj.MESSAGE_TYPES[2] }]);
          });

          // Message is ignored since there are still afMessages in the DOM
          it('should keep the "has-error" class to the element', _.partial(checkMessageClass, 'error'));
          it('should not add the "has-warning" class to the element', expectHasNoWarning);

          describe('and the messages are gone', function () {
            beforeEach(function () {
              this.$scope.messages = [];
              validate.call(this, 'user.name', [{ type: inj.MESSAGE_TYPES[2] }]);
            });
            it('should remove the "has-error" class from the element', expectHasNoError);
            it('should not add the "warning" class to the element', _.partial(checkMessageClass, 'warning'));
          });
        });
      });

      describe('when there is a "warning" message', function () {
        beforeEach(function () {
          setup.call(this, [inj.MESSAGE_TYPES[2]]);
        });

        it('should add the "has-warning" class to the element', _.partial(checkMessageClass, 'warning'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when there is an "info" message', function () {
        beforeEach(function () {
          setup.call(this, [inj.MESSAGE_TYPES[1]]);
        });

        it('should add the "has-info" class to the element', _.partial(checkMessageClass, 'info'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-success" class from the element', expectHasNoSuccess);
      });

      describe('when there is a "success" message', function () {
        beforeEach(function () {
          setup.call(this, [inj.MESSAGE_TYPES[0]]);
        });

        it('should add the "has-success" class to the element', _.partial(checkMessageClass, 'success'));
        it('should remove the "has-error" class from the element', expectHasNoError);
        it('should remove the "has-warning" class from the element', expectHasNoWarning);
        it('should remove the "has-info" class from the element', expectHasNoInfo);
      });

      describe('when there are multiple messages', function () {

        beforeEach(function () {
          setup.call(this, [inj.MESSAGE_TYPES[1], inj.MESSAGE_TYPES[0]]);
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
          setup.call(this, [inj.MESSAGE_TYPES[3]]);
        });

        it('should add the "has-error" class', _.partial(checkMessageClass, 'error'));
        it('should remove the "has-success" class', expectHasNoSuccess);
        it('should remove the "has-info" class', expectHasNoInfo);
        it('should remove the "has-warning" class', expectHasNoWarning);
      });

      describe('when there is a "success" message', function () {
        beforeEach(function () {
          setup.call(this, [inj.MESSAGE_TYPES[0]]);
        });

        it('should add the "has-success" class', _.partial(checkMessageClass, 'success'));
        it('should remove the "has-info" class', expectHasNoInfo);
        it('should remove the "has-warning" class', expectHasNoWarning);
        it('should remove the "has-error" class', expectHasNoError);
      });
    });
  });
});
