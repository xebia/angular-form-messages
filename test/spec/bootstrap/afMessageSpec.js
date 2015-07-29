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

    createScope();
    this.element = addSelectors(compileHtml('<div af-message="user.name"></div>'), {
      feedbackIcon: '.form-control-feedback',
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

    it('should show no feedback icon', function () {
      expect(this.element.feedbackIcon()).not.toExist();
    });

    it('should register the validation event listener via the MessageService', function () {
      expect(mox.get.MessageService.validation).toHaveBeenCalledWith('user.name', jasmine.any(Function));
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        mox.get.MessageService.validation.calls.reset();
        compileHtml('<div af-message af-message-id="user.name"></div>');
      });

      it('should register the validation event listener via the MessageService', function () {
        expect(mox.get.MessageService.validation).toHaveBeenCalledWith('user.name', jasmine.any(Function));
      });
    });
  });

  describe('when a validation event is fired', function () {

    function validation(messageType) {
      inj.$rootScope.$broadcast('validation', 'user.name', messages, messageType);
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

    it('should show a feedback icon in the input field', function () {
      expect(this.element.feedbackIcon()).toHaveClass('glyphicon-ok');

      validation(inj.MESSAGE_TYPES[1]);
      expect(this.element.feedbackIcon()).toHaveClass('glyphicon-info-sign');

      validation(inj.MESSAGE_TYPES[2]);
      expect(this.element.feedbackIcon()).toHaveClass('glyphicon-warning-sign');

      validation(inj.MESSAGE_TYPES[3]);
      expect(this.element.feedbackIcon()).toHaveClass('glyphicon-remove');
    });

    describe('when the validation is "valid" (no message type)', function () {
      it('should show the success feedback icon', function () {
        validation(undefined);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-ok');
      });
    });
  });

});
