describe('messageDirective', function () {

  var
    inj,
    messages;

  beforeEach(function () {
    mox
      .module(
        'angularFormMessagesBootstrap',
        'templates/bootstrap/messageDirective.html'
      )
      .mockServices('MessageService')
      .mockDirectives({
        name: 'afFeedback',
        require: 'afFeedback',
        controller: angular.noop,
        compile: function () {
          return {
            pre: function ($scope, elem, attrs, afFeedbackCtrl) {
              afFeedbackCtrl.messageId = attrs.afFeedback;
            }
          };
        }
      })
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
    messages = [
      { message: 'This is the first message', type: inj.MESSAGE_TYPES[0] },
      { message: 'This is the second message', type: inj.MESSAGE_TYPES[1] },
      { message: 'This is the third message', type: inj.MESSAGE_TYPES[2] },
      { message: 'This is the fourth message', type: inj.MESSAGE_TYPES[3] }
    ];

    createScope({
      messageId: 'user.name'
    });
    this.element = addSelectors(compileHtml('<form name="userForm"><div af-message="user.name"></div></form>'), {
      feedbackIcon: '.form-control-feedback',
      feedbackScreenreader: '.form-control-feedback + .sr-only',
      alerts: '.alert',
      alert: {
        selector: '.alert:eq({0})',
        sub: {
          icon: '.glyphicon',
          prefix: '.sr-only'
        }
      }
    });

  });

  describe('on initialization', function () {
    it('should show no messages', function () {
      expect(this.element.alerts()).not.toExist();
    });

    it('should show no feedback', function () {
      expect(this.element.feedbackIcon()).not.toExist();
      expect(this.element.feedbackScreenreader()).not.toExist();
    });

    it('should register the validation event listener via the MessageService', function () {
      expect(mox.get.MessageService.validation).toHaveBeenCalledWith('userForm.user.name', jasmine.any(Function));
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        mox.get.MessageService.validation.calls.reset();
        compileHtml('<form name="userForm"><div af-message af-message-id="user.name"></div></form>');
      });

      it('should register the validation event listener via the MessageService', function () {
        expect(mox.get.MessageService.validation).toHaveBeenCalledWith('userForm.user.name', jasmine.any(Function));
      });
    });
  });

  describe('when a validation event is fired', function () {

    function validation(messageType) {
      inj.$rootScope.$broadcast('validation', 'userForm.user.name', messages, messageType);
      inj.$rootScope.$digest();
    }

    beforeEach(function () {
      validation(inj.MESSAGE_TYPES[0]);
    });

    it('should show the messages', function () {
      expect(this.element.alerts()).toHaveLength(messages.length);
    });

    it('should the message text and type', function () {
      expect(this.element.alert(0).prefix()).toHaveText(messages[0].type + ':');
      expect(this.element.alert(1).prefix()).toHaveText(messages[1].type + ':');
      expect(this.element.alert(0)).toContainText(messages[0].message);
      expect(this.element.alert(1)).toContainText(messages[1].message);
    });

    it('should show an alert class for messages with type error, warning, info and success', function () {
      expect(this.element.alert(0)).toHaveClass('alert-success');
      expect(this.element.alert(1)).toHaveClass('alert-info');
      expect(this.element.alert(2)).toHaveClass('alert-warning');
      expect(this.element.alert(3)).toHaveClass('alert-danger');
    });

    it('should show a message type icon', function () {
      expect(this.element.alert(0).icon()).toHaveClass('glyphicon-ok');
      expect(this.element.alert(1).icon()).toHaveClass('glyphicon-info-sign');
      expect(this.element.alert(2).icon()).toHaveClass('glyphicon-warning-sign');
      expect(this.element.alert(3).icon()).toHaveClass('glyphicon-exclamation-sign');
    });

    describe('when there is a parent afFeedback directive with the same messageId', function () {

      beforeEach(function () {
        this.element = addSelectors(compileHtml('<form name="userForm"><div af-feedback="user.name"><div af-message="user.name"></div></div></form>'), {
          feedbackIcon: '.form-control-feedback',
          feedbackText: '.form-control-feedback + .sr-only'
        });
        validation();
      });

      it('should show a feedback icon in the input field', function () {
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-ok');
        expect(this.element.feedbackText()).toHaveText('(SUCCESS)');

        validation(inj.MESSAGE_TYPES[1]);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-info-sign');
        expect(this.element.feedbackText()).toHaveText('(INFO)');

        validation(inj.MESSAGE_TYPES[2]);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-warning-sign');
        expect(this.element.feedbackText()).toHaveText('(WARNING)');

        validation(inj.MESSAGE_TYPES[3]);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-remove');
        expect(this.element.feedbackText()).toHaveText('(ERROR)');
      });

      describe('when the validation is "valid" (no message type)', function () {
        it('should show the success feedback icon', function () {
          validation(undefined);
          expect(this.element.feedbackIcon()).toHaveClass('glyphicon-ok');
          expect(this.element.feedbackText()).toHaveText('(SUCCESS)');
        });
      });
    });

    describe('when there is no parent afFeedback directive with the same messageId', function () {
      beforeEach(function () {
        addSelectors(compileHtml('<form name="userForm"><div af-feedback="user.other"><div af-message="user.name"></div></div></form>'), {
          feedback: '[data-test="feedback"]'
        });
        validation();
      });

      it('should not show feedback', function () {
        expect(this.element.feedback()).not.toExist();
      });
    });
  });

});
