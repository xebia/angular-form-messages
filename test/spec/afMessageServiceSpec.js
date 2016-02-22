describe('AfMessageService', function () {
  var
    afMessageServiceProvider,
    inj,
    messages;

  beforeEach(function () {
    angular
      .module('angularFormMessages')
      .config(function (AfMessageServiceProvider) {
        afMessageServiceProvider = AfMessageServiceProvider;
      });

    mox
      .module('angularFormMessages')
      .run();

    createScope();
    inj = mox.inject(
      'AfMessageService',
      'MESSAGE_TYPES',
      'SHOW_MULTIPLE'
    );
    messages = {
      success: { type: inj.MESSAGE_TYPES[0] },
      info: { type: inj.MESSAGE_TYPES[1] },
      warning: { type: inj.MESSAGE_TYPES[2] },
      error: { type: inj.MESSAGE_TYPES[3] }
    };
  });

  describe('validatorLabelPrefix', function () {
    it('should return the configured validatorLabelPrefix value with a dot', function () {
      expect(inj.AfMessageService.getValidatorLabelPrefix()).toBeFalsy();

      afMessageServiceProvider.setValidatorLabelPrefix('prefix');
      expect(inj.AfMessageService.getValidatorLabelPrefix()).toBe('prefix.');
    });
  });

  describe('fieldValidatorLabelPrefix', function () {
    it('should return the configured fieldValidatorLabelPrefix value with a dot', function () {
      expect(inj.AfMessageService.getFieldValidatorLabelPrefix()).toBeFalsy();

      afMessageServiceProvider.setFieldValidatorLabelPrefix('prefix');
      expect(inj.AfMessageService.getFieldValidatorLabelPrefix()).toBe('prefix.');
    });
  });

  describe('scrollToError', function () {
    it('should return the configured scrollToError value', function () {
      expect(inj.AfMessageService.scrollToError()).toBe(true);

      afMessageServiceProvider.setScrollToError(false);
      expect(inj.AfMessageService.scrollToError()).toBe(false);
    });
  });

  describe('showMultiple', function () {
    it('should return the configured showMultiple value', function () {
      expect(inj.AfMessageService.showMultiple()).toBe(true);

      afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ONE);
      expect(inj.AfMessageService.showMultiple()).toBe(inj.SHOW_MULTIPLE.ONE);
    });
  });

  describe('showSuccess', function () {
    it('should return the configured showSuccess value', function () {
      expect(inj.AfMessageService.showSuccess()).toBe(false);

      afMessageServiceProvider.setShowSuccess(true);
      expect(inj.AfMessageService.showSuccess()).toBe(true);
    });
  });

  describe('triggerOn', function () {
    it('should return the configured triggerOn value', function () {
      expect(inj.AfMessageService.triggerOn()).toBe('change');

      afMessageServiceProvider.setTriggerOn('newValue');
      expect(inj.AfMessageService.triggerOn()).toBe('newValue');
    });
  });

  describe('getMostSevereMessage()', function () {
    it('should return the message that has the highest severity', function () {
      expect(inj.AfMessageService.getMostSevereMessage([
        messages.success,
        messages.info
      ])).toBe(messages.info);

      expect(inj.AfMessageService.getMostSevereMessage([
        messages.info,
        messages.info
      ])).toBe(messages.info);

      expect(inj.AfMessageService.getMostSevereMessage([
        messages.warning,
        messages.success
      ])).toBe(messages.warning);
    });

    it('should return undefined when there are no messages', function () {
      expect(inj.AfMessageService.getMostSevereMessage()).toBeUndefined();
      expect(inj.AfMessageService.getMostSevereMessage([])).toBeUndefined();
    });
  });

  describe('getMessagesToShow', function () {
    describe('when we want to show one message in total', function () {
      beforeEach(function () {
        afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ONE);
      });

      it('should return the filtered object with one message', function () {
        expect(inj.AfMessageService.getMessagesToShow({
          name: [messages.success, messages.warning],
          email: [messages.success]
        })).toEqual({
          name: [messages.warning]
        });
      });
    });

    describe('when we want to show one message per fieldName', function () {
      beforeEach(function () {
        afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ONE_PER_MESSAGE_ID);
      });

      it('should return the filtered object with one message per fieldName', function () {
        expect(inj.AfMessageService.getMessagesToShow({
          name: [messages.warning, messages.success],
          email: [messages.success]
        })).toEqual({
          name: [messages.warning],
          email: [messages.success]
        });
      });
    });

    describe('when we want to show all messages', function () {
      beforeEach(function () {
        afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ALL);
      });

      it('should return the same object', function () {
        var allMessages = {
          name: [messages.warning, messages.success],
          email: [messages.success]
        };
        expect(inj.AfMessageService.getMessagesToShow(allMessages)).toBe(allMessages);
      });
    });

    describe('when there exists a fieldName key without messages', function () {
      it('should remove the empty keys except for when you want to show all messages', function () {
        afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ALL);
        var allMessages = {
          name: [],
          email: [messages.success]
        };
        expect(inj.AfMessageService.getMessagesToShow(allMessages)).toBe(allMessages);

        afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ONE_PER_MESSAGE_ID);
        expect(inj.AfMessageService.getMessagesToShow({
          name: [],
          email: [messages.success]
        })).toEqual({
          email: [messages.success]
        });

        afMessageServiceProvider.setShowMultiple(inj.SHOW_MULTIPLE.ONE);
        expect(inj.AfMessageService.getMessagesToShow({
          name: [],
          email: [messages.success],
          other: [messages.warning]
        })).toEqual({
          other: [messages.warning]
        });
      });
    });
  });

  describe('validation()', function () {

    beforeEach(function () {
      this.cb = jasmine.createSpy('validation');
    });

    describe('when the fieldName is the same as the fieldName passed to the validation registrer', function () {
      beforeEach(function () {
        inj.AfMessageService.validation(this.$scope, 'user.name', this.cb);
      });

      it('should call the callback with passed messages and messageType arguments', function () {
        this.$scope.$emit('validation', 'user.name', []);
        expect(this.cb).toHaveBeenCalledWith('user.name', []);
      });
    });

    describe('when the fieldName is not the same as the fieldName passed to the validation registrer', function () {
      beforeEach(function () {
        inj.AfMessageService.validation(this.$scope, 'user.name', this.cb);
      });

      it('should not call the callback with passed messages and messageType arguments', function () {
        this.$scope.$emit('validation', 'user.other', []);
        expect(this.cb).not.toHaveBeenCalled();
      });
    });

    describe('when the passed fieldName starts with the validation event fieldName', function () {
      it('should not call the callback when we do not want partial matches', function () {
        inj.AfMessageService.validation(this.$scope, 'user', this.cb);
        this.$scope.$emit('validation', 'user.name', []);
        expect(this.cb).not.toHaveBeenCalled();
      });

      it('should call the callback with passed messages and messageType arguments', function () {
        inj.AfMessageService.validation(this.$scope, 'user', this.cb, true);
        this.$scope.$emit('validation', 'user.name', [], 'messageType');
        expect(this.cb).toHaveBeenCalledWith('user.name', []);
      });
    });
  });
});
