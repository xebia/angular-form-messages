describe('afMessages', function () {

  function getController(element) {
    return element.controller('afMessages');
  }

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .run();

    createScope();
    compileHtml('<div af-messages="user.name" af-field-name-prefix="user"></div>');
  });

  describe('on initialization', function () {
    it('should store the message id on the controller', function () {
      expect(getController(this.element).fieldName).toBe('user.name');
    });

    it('should store the message id start on the controller', function () {
      expect(getController(this.element).fieldNamePrefix).toBe('user');
    });

    describe('when the fieldName is passed via the fieldName attribute', function () {
      beforeEach(function () {
        compileHtml('<div af-messages af-field-name="user.name"></div>');
      });

      it('should store the message id including the form name on the controller', function () {
        expect(getController(this.element).fieldName).toBe('user.name');
      });
    });
  });
});
