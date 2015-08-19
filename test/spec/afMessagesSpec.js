describe('afMessages', function () {

  function getController(element) {
    return element.controller('afMessages');
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope();
    compileHtml('<div af-messages="user.name" af-message-id-prefix="user"></div>');
  });

  describe('on initialization', function () {
    it('should store the message id on the controller', function () {
      expect(getController(this.element).messageId).toBe('user.name');
    });

    it('should store the message id start on the controller', function () {
      expect(getController(this.element).messageIdPrefix).toBe('user');
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        compileHtml('<div af-messages af-message-id="user.name"></div>');
      });

      it('should store the message id including the form name on the controller', function () {
        expect(getController(this.element).messageId).toBe('user.name');
      });
    });
  });
});
