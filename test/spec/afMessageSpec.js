describe('afMessage', function () {

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope();
    compileHtml('<div af-message="user.name"></div>');
  });

  describe('on initialization', function () {
    it('should store the message id including the form name on the controller', function () {
      expect(this.element.controller('afMessage').messageId).toBe('user.name');
    });

    describe('when the messageId is passed via the messageId attribute', function () {
      beforeEach(function () {
        compileHtml('<div af-message af-message-id="user.name"></div>');
      });

      it('should store the message id including the form name on the controller', function () {
        expect(this.element.controller('afMessage').messageId).toBe('user.name');
      });
    });
  });
});
