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
                afFeedbackCtrl.messageId = attrs.afFeedback;
              }
            };
          }
        }
      )
      //.disableDirectives('afMessageLabel')
      .setupResults(function () {
        return {
          AfMessageService: {
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
    this.element = addSelectors(compileHtml('<form name="userForm" af-submit><div af-message="user.name"></div></form>'), {
      feedbackIcon: '.form-control-feedback',
      feedbackScreenreader: '.form-control-feedback + .sr-only',
      alerts: '.alert',
      alert: {
        selector: '.alert:eq({0})',
        sub: {
          icon: '.glyphicon',
          prefix: '.sr-only',
          label: '[af-message-label]'
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

    it('should register the validation event listener via the AfMessageService', function () {
      expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith('userForm.user.name', jasmine.any(Function));
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        mox.get.AfMessageService.validation.calls.reset();
        compileHtml('<form name="userForm" af-submit><div af-message af-message-id="user.name"></div></form>');
      });

      it('should register the validation event listener via the AfMessageService', function () {
        expect(mox.get.AfMessageService.validation).toHaveBeenCalledWith('userForm.user.name', jasmine.any(Function));
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
      expect(this.element.alert(0).label()).toHaveAttr('af-message-label', messages[0].message);
      expect(this.element.alert(1).label()).toHaveAttr('af-message-label', messages[1].message);
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
        this.element = addSelectors(compileHtml('<form name="userForm" af-submit><div af-feedback="user.name" af-show-success="true"><div af-message="user.name"></div></div></form>'), {
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
        validation(inj.MESSAGE_TYPES[0]);
        var feedback = this.element.feedback();
        expect(feedback.icon()).toHaveClass('glyphicon-ok');
        expect(feedback.label()).toHaveText('(SUCCESS)');

        validation.call(this, inj.MESSAGE_TYPES[1]);
        expect(feedback.icon()).toHaveClass('glyphicon-info-sign');
        expect(feedback.label()).toHaveText('(INFO)');

        validation.call(this, inj.MESSAGE_TYPES[2]);
        expect(feedback.icon()).toHaveClass('glyphicon-warning-sign');
        expect(feedback.label()).toHaveText('(WARNING)');

        validation.call(this, inj.MESSAGE_TYPES[3]);
        expect(feedback.icon()).toHaveClass('glyphicon-remove');
        expect(feedback.label()).toHaveText('(ERROR)');
      });

      describe('when the validation is "valid" (no message type)', function () {
        describe('when showSucces is true on the afSubmit', function () {
          beforeEach(function () {
            this.element.controller('afSubmit').showSuccess = true;
            validation();
          });

          it('should show the success feedback icon', function () {
            expect(this.element.feedback().icon()).toHaveClass('glyphicon-ok');
            expect(this.element.feedback().label()).toHaveText('(SUCCESS)');
          });
        });

        describe('when showSuccess is false on the afSubmit', function () {
          beforeEach(function () {
            this.element.controller('afSubmit').showSuccess = false;
            validation();
          });

          it('should show the success feedback icon', function () {
            expect(this.element.feedback()).not.toExist();
          });
        });
      });
    });

    describe('when there is no parent afFeedback directive with the same messageId', function () {
      beforeEach(function () {
        addSelectors(compileHtml('<form name="userForm" af-submit><div af-feedback="user.other"><div af-message="user.name"></div></div></form>'), {
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
