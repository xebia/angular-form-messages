describe('the afMessageLabel directive', function () {
  var $log;

  beforeEach(function () {
    mox
      .module('angularFormMessagesBootstrap')
      .mockServices(
        'AfMessageService',
        '$translate'
      )
      .mockDirectives({
        name: 'afMessage',
        controller: function () {
          this.messageId = 'user.email';
        }
      })
      .setupResults(function () {
        return {
          AfMessageService: {
            getGenericLabelPrefix: 'prefix.'
          },
          $translate: function (key) {
            var translations = {
              'userForm.user.email.email': 'E-mail translation',
              'prefix.required': 'Required translation'
            };
            return key in translations ? promise(translations[key]) : reject(key);
          }
        };
      })
      .run();

    createScope();
    compileHtml('<form name="userForm"><div af-message><span af-message-label="{{key}}">Content</span></div></form>');
    $log = mox.inject('$log');
    spyOn($log, 'warn');
  });

  it('should do nothing when the key is empty', function () {
    expect(this.element).toHaveText('Content');
  });

  it('should replace the contents of the element with the field specific translation if this exists', function () {
    this.$scope.key = 'email';
    this.$scope.$digest();
    expect(this.element).toHaveText('E-mail translation');
  });

  it('should replace the contents of the element with the generic translation if this exists', function () {
    this.$scope.key = 'required';
    this.$scope.$digest();
    expect(this.element).toHaveText('Required translation');
  });

  it('should show the key if the generic translation does not exist', function () {
    this.$scope.key = 'specific not existing';
    this.$scope.$digest();
    expect(this.element).toHaveText('specific not existing');

    this.$scope.key = 'generic not existing';
    this.$scope.$digest();
    expect(this.element).toHaveText('generic not existing');
  });

  it('should log a warning when the translations do not exist', function () {
    this.$scope.key = 'not-existing';
    this.$scope.$digest();
    expect($log.warn).toHaveBeenCalledWith('Missing label: \'userForm.user.email.not-existing\' (specific) or \'prefix.not-existing\' (generic)');
  });

  describe('when the field is in a sub form with dynamic name', function () {
    // This test also passes when we do not use $interpolate, but it is necessary for angular 1.2
    beforeEach(function () {
      compileHtml('<form name="userForm">' +
          '<div ng-form name="subForm{{$index}}" ng-repeat="messageId in [\'not-existing\', \'something-else\']">' +
            '<div af-message><span af-message-label="{{messageId}}">Content</span></div>' +
          '</div>' +
        '</form>');
    });

    it('should validate these as well', function () {
      this.$scope.key = 'not-existing';
      this.$scope.$digest();
      expect($log.warn).toHaveBeenCalledWith('Missing label: \'subForm0.user.email.not-existing\' (specific) or \'prefix.not-existing\' (generic)');
      expect($log.warn).toHaveBeenCalledWith('Missing label: \'subForm1.user.email.something-else\' (specific) or \'prefix.something-else\' (generic)');
    });
  });
});
