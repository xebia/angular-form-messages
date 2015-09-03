describe('afMessages', function () {

  function compile() {
    createScope({
      fieldName: 'user.name'
    });
    addSelectors(compileHtml('<form name="userForm" af-submit><div af-messages="user.name"></div></form>'), {
      feedbackIcon: '.form-control-feedback',
      feedbackScreenreader: '.form-control-feedback + .sr-only',
      helpBlocks: {
        repeater: '.help-block',
        sub: {
          icon: '.glyphicon',
          prefix: '.sr-only',
          label: '[af-message-label]'
        }
      }
    });
  }

  var
    MESSAGE_TYPES,
    messages;

  beforeEach(function () {
    mox
      .module(
        'angularFormMessagesBootstrap',
        'templates/bootstrap/messages.html'
      )
      .mockServices(
        'AfMessageService',
        '$translate'
      )
      .mockDirectives(
        'afMessageLabel',
        {
          name: 'afFeedback',
          require: 'afFeedback',
          controller: angular.noop,
          compile: function () {
            return {
              pre: function ($scope, elem, attrs, afFeedbackCtrl) {
                afFeedbackCtrl.fieldName = attrs.afFeedback;
              }
            };
          }
        }
      )
      .setupResults(function () {
        return {
          AfMessageService: {
            getMessagesToShow: function (messages) { return messages; },
            validation: function ($scope, fieldName, callback) {
              // This method is quite hard to mock, so we mimic the implementation, except for the fieldName condition
              $scope.$on('validation', function (event, validationFieldName, messages) {
                callback(validationFieldName, angular.copy(messages));
              });
            }
          }
        };
      })
      .run();

    MESSAGE_TYPES = mox.inject('MESSAGE_TYPES');
    messages = [
      { message: 'This is the first message', type: MESSAGE_TYPES[0] },
      { message: 'This is the second message', type: MESSAGE_TYPES[1] },
      { message: 'This is the third message', type: MESSAGE_TYPES[2] },
      { message: 'This is the fourth message', type: MESSAGE_TYPES[3] }
    ];

    compile.call(this);
  });

  describe('on initialization', function () {
    it('should show no messages', function () {
      expect(this.element.helpBlocks()).not.toExist();
    });

    it('should show no feedback', function () {
      expect(this.element.feedbackIcon()).not.toExist();
      expect(this.element.feedbackScreenreader()).not.toExist();
    });

    it('should register the validation event listener via the AfMessageService and not allows partial fieldNames', function () {
      // this.$scope is the scope outside the directive, which is the same scope as $scope.$parent which is called from inside the directive
      expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith(this.$scope, 'user.name', jasmine.any(Function), false);
    });

    describe('when the fieldName is passed via the fieldName attribute', function () {
      beforeEach(function () {
        mox.get.AfMessageService.validation.calls.reset();
        compileHtml.call(this, '<form name="userForm" af-submit><div af-messages af-field-name="user.name"></div></form>');
      });

      it('should register the validation event listener via the AfMessageService and not allows partial fieldNames', function () {
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith(this.$scope, 'user.name', jasmine.any(Function), false);
      });
    });

    describe('when there is a fieldNamePrefix passed', function () {
      beforeEach(function () {
        mox.get.AfMessageService.validation.calls.reset();
        compileHtml.call(this, '<form name="userForm" af-submit><div af-messages af-field-name-prefix="user"></div></form>');
      });

      it('should register the validation event listener via the AfMessageService and allows partial fieldNames', function () {
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith(this.$scope, 'user', jasmine.any(Function), true);
      });
    });
  });

  describe('when a validation event is fired', function () {

    function validation(messageType) {
      mox.get.AfMessageService.getMostSevereMessage.and.returnValue({ type: messageType });
      this.$scope.$emit('validation', 'user.name', messages);
      this.$scope.$digest();
    }

    beforeEach(function () {
      compile();
      mox.get.AfMessageService.validation.calls.reset();
      validation.call(this, MESSAGE_TYPES[0]);
    });

    it('should show the messages', function () {
      expect(this.element.helpBlocks()).toHaveLength(messages.length);
    });

    describe('and there are no messages to show', function () {
      beforeEach(function () {
        this.$scope.$emit('validation', 'user.name', [], undefined);
        this.$scope.$digest();
      });

      it('should show no messages', function () {
        expect(this.element.helpBlocks()).toHaveLength(0);
      });
    });

    it('should the message text and type', function () {
      expect(this.element.helpBlocks(0).prefix()).toHaveText(messages[0].type + ':');
      expect(this.element.helpBlocks(1).prefix()).toHaveText(messages[1].type + ':');
      expect(this.element.helpBlocks(0).label()).toHaveAttr('af-message-label', messages[0].message);
      expect(this.element.helpBlocks(1).label()).toHaveAttr('af-message-label', messages[1].message);
    });

    describe('when we want to show the message as alert', function () {
      beforeEach(function () {
        addSelectors(compileHtml('<form name="userForm" af-submit><div af-messages="user.name" af-alert></div></form>'), {
          alerts: {
            repeater: '.alert'
          }
        });
        validation.call(this, MESSAGE_TYPES[0]);
      });

      it('should show an alert class for messages with type error, warning, info and success', function () {
        expect(this.element.alerts(0)).toHaveClass('alert-success');
        expect(this.element.alerts(1)).toHaveClass('alert-info');
        expect(this.element.alerts(2)).toHaveClass('alert-warning');
        expect(this.element.alerts(3)).toHaveClass('alert-danger');
      });
    });

    it('should show a message type icon', function () {
      expect(this.element.helpBlocks(0).icon()).toHaveClass('glyphicon-ok');
      expect(this.element.helpBlocks(1).icon()).toHaveClass('glyphicon-info-sign');
      expect(this.element.helpBlocks(2).icon()).toHaveClass('glyphicon-warning-sign');
      expect(this.element.helpBlocks(3).icon()).toHaveClass('glyphicon-exclamation-sign');
    });

    describe('when there is a fieldNamePrefix set and there is a second validation event with another fieldName that also matches', function () {
      beforeEach(function () {
        addSelectors(compileHtml.call(this, '<form name="userForm" af-submit><div af-messages af-field-name-prefix="user"></div></form>'), {
          helpBlocks: {
            repeater: '.help-block',
            sub: {
              messageLabel: '[af-message-label]'
            }
          }
        });
        this.$scope.$emit('validation', 'user.name', messages, MESSAGE_TYPES[0]);
        this.$scope.$digest();
        this.$scope.$emit('validation', 'user.email', messages, MESSAGE_TYPES[0]);
        this.$scope.$digest();
      });

      it('should not overwrite the messages for a different fieldName', function () {
        expect(this.element.helpBlocks()).toHaveLength(messages.length * 2);
      });

      it('should overwrite messages for the same fieldName', function () {
        this.$scope.$emit('validation', 'user.email', [messages[0]], MESSAGE_TYPES[0]);
        this.$scope.$digest();
        expect(this.element.helpBlocks()).toHaveLength(messages.length + 1);
      });

      it('should filter the messages', function () {
        expect(mox.get.AfMessageService.getMessagesToShow).toHaveBeenCalledWith(jasmine.any(Object));
      });
    });

    describe('when there is a parent afFeedback directive with the same fieldName', function () {

      beforeEach(function () {
        this.element = addSelectors(compileHtml('<form name="userForm" af-submit><div af-feedback="user.name" af-show-success="true"><div af-messages="user.name"></div></div></form>'), {
          feedback: {
            selector: '[data-test="feedback"]',
            sub: {
              icon: '.form-control-feedback',
              label: '.form-control-feedback + .sr-only'
            }
          }
        });
      });

      it('should show a feedback icon in the input field', function () {
        validation.call(this, MESSAGE_TYPES[0]);
        var feedback = this.element.feedback();
        expect(feedback.icon()).toHaveClass('glyphicon-ok');
        expect(feedback.label()).toHaveText('(SUCCESS)');

        validation.call(this, MESSAGE_TYPES[1]);
        expect(feedback.icon()).toHaveClass('glyphicon-info-sign');
        expect(feedback.label()).toHaveText('(INFO)');

        validation.call(this, MESSAGE_TYPES[2]);
        expect(feedback.icon()).toHaveClass('glyphicon-warning-sign');
        expect(feedback.label()).toHaveText('(WARNING)');

        validation.call(this, MESSAGE_TYPES[3]);
        expect(feedback.icon()).toHaveClass('glyphicon-remove');
        expect(feedback.label()).toHaveText('(ERROR)');
      });

      describe('when the validation is "valid" (no message type)', function () {
        describe('when showSucces is true on the afSubmit', function () {
          beforeEach(function () {
            this.element.controller('afSubmit').showSuccess = true;
            validation.call(this);
          });

          it('should show the success feedback icon', function () {
            expect(this.element.feedback().icon()).toHaveClass('glyphicon-ok');
            expect(this.element.feedback().label()).toHaveText('(SUCCESS)');
          });
        });

        describe('when showSuccess is false on the afSubmit', function () {
          beforeEach(function () {
            this.element.controller('afSubmit').showSuccess = false;
            validation.call(this);
          });

          it('should show the success feedback icon', function () {
            expect(this.element.feedback()).not.toExist();
          });
        });
      });
    });

    describe('when there is no parent afFeedback directive with the same fieldName', function () {
      beforeEach(function () {
        addSelectors(compileHtml.call(this, '<form name="userForm" af-submit><div af-feedback="user.other"><div af-messages="user.name"></div></div></form>'), {
          feedback: '[data-test="feedback"]'
        });
        validation.call(this);
      });

      it('should not show feedback', function () {
        expect(this.element.feedback()).not.toExist();
      });
    });
  });

});
