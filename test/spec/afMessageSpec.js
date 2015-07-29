describe('afMessage', function () {
  var $rootScope;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices('MessageService')
      .setupResults(function () {
        $rootScope = mox.inject('$rootScope');
        return {
          MessageService: {
            validation: function (messageId, callback) {
              // This method is quite hard to mock, so we mimic the implementation, except for the messageId condition
              $rootScope.$on('validation', function (event, validationMessageId, messages, messageType) {
                callback(messages, messageType);
              });
            }
          }
        };
      })
      .run();

    createScope({
      messages: [
        { message: 'Initial message', type: 'error' } // Directive has no isolate scope, so we can set values on the parent scope initially
      ]
    });
    compileHtml('<div af-message="user.name"></div>');
  });

  describe('on initialization', function () {
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

  describe('when a validation event is broadcasted', function () {
    describe('when the field is valid', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.name', []);
      });

      it('should remove the message', function () {
        expect(this.element.scope().messages).toEqual([]);
      });
    });

    describe('when the field is invalid', function () {
      beforeEach(function () {
        $rootScope.$broadcast('validation', 'user.name', [{ message: 'New error', type: 'error' }]);
      });

      it('should set the message on the scope', function () {
        expect(this.element.scope().messages).toEqual([{ message: 'New error', type: 'error' }]);
      });
    });
  });
});
