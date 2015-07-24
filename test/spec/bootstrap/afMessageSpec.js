describe('messageDirective', function () {

  function validateWithMessageType(messageType) {
    inj.$rootScope.$broadcast('validation', 'user.name', messages, messageType);
    this.$scope.$digest();
  }

  var
    inj,
    messages;

  beforeEach(function () {
    mox.module(
      'angularFormMessages',
      'angularFormMessagesBootstrap',
      'templates/messageDirective.html'
    ).run();

    inj = mox.inject('$rootScope', 'MESSAGE_TYPES');
    messages = [
      { message: 'This is the message', type: inj.MESSAGE_TYPES[0] },
      { message: 'This is the second message', type: inj.MESSAGE_TYPES[1] },
      { message: 'This is the third message', type: inj.MESSAGE_TYPES[2] },
      { message: 'This is the fourth message', type: inj.MESSAGE_TYPES[3] }
    ];

    createScope();
    this.element = addSelectors(compileHtml('<form><div af-message="user.name"></div></form>'), {
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
  });

  describe('when a validation event is fired', function () {
    describe('when the the event is not addressed to this message directive', function () {
      beforeEach(function () {
        inj.$rootScope.$broadcast('validation', 'user.other', messages, inj.MESSAGE_TYPES[0]);
        this.$scope.$digest();
      });

      it('should do nothing', function () {
        expect(this.element.alerts()).not.toExist();
        expect(this.element.feedbackIcon()).not.toExist();
      });
    });

    describe('when the event is addresses to this message directive', function () {

      beforeEach(function () {
        inj.$rootScope.$broadcast('validation', 'user.name', messages, inj.MESSAGE_TYPES[0]);
        this.$scope.$digest();
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

        validateWithMessageType.call(this, inj.MESSAGE_TYPES[1]);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-info-sign');

        validateWithMessageType.call(this, inj.MESSAGE_TYPES[2]);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-warning-sign');

        validateWithMessageType.call(this, inj.MESSAGE_TYPES[3]);
        expect(this.element.feedbackIcon()).toHaveClass('glyphicon-remove');

      });

      describe('when the validation is "valid" (no message type)', function () {
        it('should show the success feedback icon', function () {
          validateWithMessageType.call(this, undefined);
          expect(this.element.feedbackIcon()).toHaveClass('glyphicon-ok');
        });
      });
    });
  });

});
