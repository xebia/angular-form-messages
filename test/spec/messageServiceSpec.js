describe('MessageService', function () {
  var inj;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    inj = mox.inject(
      '$rootScope',
      'MESSAGE_TYPES',
      'MessageService'
    );
  });

  describe('determineMessageType()', function () {
    it('should return the message type that has the highest severity', function () {
      expect(inj.MessageService.determineMessageType([
        { type: inj.MESSAGE_TYPES[0] },
        { type: inj.MESSAGE_TYPES[1] }
      ])).toBe(inj.MESSAGE_TYPES[1]);

      expect(inj.MessageService.determineMessageType([
        { type: inj.MESSAGE_TYPES[1] },
        { type: inj.MESSAGE_TYPES[1] }
      ])).toBe(inj.MESSAGE_TYPES[1]);

      expect(inj.MessageService.determineMessageType([
        { type: inj.MESSAGE_TYPES[2] },
        { type: inj.MESSAGE_TYPES[0] }
      ])).toBe(inj.MESSAGE_TYPES[2]);
    });

    it('should return undefined when there are no messages', function () {
      expect(inj.MessageService.determineMessageType()).toBeUndefined();
      expect(inj.MessageService.determineMessageType([])).toBeUndefined();
    });
  });

  describe('validation()', function () {
    beforeEach(function () {
      this.cb = jasmine.createSpy('validation');
      inj.MessageService.validation('name', this.cb);
    });

    describe('when the message type is the same as the messageType passed to the validation registrer', function () {
      it('should call the callback with passed messages and messageType arguments', function () {
        inj.$rootScope.$broadcast('validation', 'name', [], 'messageType');
        expect(this.cb).toHaveBeenCalledWith([], 'messageType');
      });
    });

    describe('when the message type is the same as the messageType passed to the validation registrer', function () {
      it('should call the callback with passed messages and messageType arguments', function () {
        inj.$rootScope.$broadcast('validation', 'other', [], 'messageType');
        expect(this.cb).not.toHaveBeenCalled();
      });
    });
  });
});
