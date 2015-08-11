describe('AfMessageService', function () {
  var
    formCtrl = {},
    afMessageServiceProvider,
    inj;

  beforeEach(function () {
    angular
      .module('angularFormMessages')
      .config(function (AfMessageServiceProvider) {
        afMessageServiceProvider = AfMessageServiceProvider;
      });

    mox
      .module('angularFormMessages')
      .run();

    inj = mox.inject(
      '$rootScope',
      'MESSAGE_TYPES',
      'AfMessageService'
    );
  });

  describe('genericLabelPrefix', function () {
    it('should return the configured genericLabelPrefix value with a dot', function () {
      expect(inj.AfMessageService.getGenericLabelPrefix()).toBeFalsy();

      afMessageServiceProvider.setGenericLabelPrefix('prefix');
      expect(inj.AfMessageService.getGenericLabelPrefix()).toBe('prefix.');
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

      afMessageServiceProvider.setShowMultiple(false);
      expect(inj.AfMessageService.showMultiple()).toBe(false);
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
      var messages = {
        success: { type: inj.MESSAGE_TYPES[0] },
        info: { type: inj.MESSAGE_TYPES[1] },
        warning: { type: inj.MESSAGE_TYPES[2] }
      };
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

  describe('validation()', function () {
    beforeEach(function () {
      this.cb = jasmine.createSpy('validation');
      inj.AfMessageService.validation(formCtrl, 'formName.name', this.cb);
    });

    describe('when the message type is the same as the messageType passed to the validation registrer', function () {
      it('should call the callback with passed messages and messageType arguments', function () {
        inj.$rootScope.$broadcast('validation', formCtrl, 'formName.name', [], 'messageType');
        expect(this.cb).toHaveBeenCalledWith([], 'messageType');
      });
    });

    describe('when the message type is not the same as the messageType passed to the validation registrer', function () {
      it('should call the callback with passed messages and messageType arguments', function () {
        inj.$rootScope.$broadcast('validation', formCtrl, 'formName.other', [], 'messageType');
        expect(this.cb).not.toHaveBeenCalled();
      });
    });

    describe('when the form controller is not the same as the form controller passed to the validation registrer', function () {
      it('should call the callback with passed messages and messageType arguments', function () {
        inj.$rootScope.$broadcast('validation', { other: 'ctrl' }, 'formName.name', [], 'messageType');
        expect(this.cb).not.toHaveBeenCalled();
      });
    });
  });
});
