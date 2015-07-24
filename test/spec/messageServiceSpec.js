describe('MessageService', function () {
  var inj;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    inj = mox.inject('MESSAGE_TYPES', 'MessageService');
  });

  describe('determineMessageType', function () {
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
});
