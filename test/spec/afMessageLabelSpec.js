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
        name: 'afMessages',
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
              'prefix.required': 'Required translation',
              'userForm.name': 'Name translation form',
              'userForm.user.email.email': 'E-mail translation',
              'subForm0.user.email.required': 'Required translation sub form',
              'subForm1.user.email.email': 'E-mail translation sub form'
            };
            return key in translations ? promise(translations[key]) : reject(key);
          }
        };
      })
      .run();

    createScope();
    compileHtml('<form name="userForm"><div af-messages><span af-message-label="{{key}}">Content</span></div></form>');
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

  describe('when the messageId is passed as prefix', function () {
    beforeEach(function () {
      addSelectors(compileHtml('<form name="userForm"><div af-messages><span af-message-label="{{key}}">Content</span></div></form>'), {
        messages: '[af-messages]'
      });
      var afMessagesCtrl = this.element.messages().controller('afMessages');
      delete afMessagesCtrl.messageId;
      afMessagesCtrl.messageIdPrefix = 'user.email';
    });

    it('should replace the contents of the element with the translation', function () {
      this.$scope.key = 'email';
      this.$scope.$digest();
      expect(this.element).toHaveText('E-mail translation');
    });
  });

  describe('when the field is in a sub form with dynamic name', function () {
    // This test also passes when we do not use $interpolate, but it is necessary for angular 1.2
    beforeEach(function () {
      addSelectors(compileHtml('<form name="userForm">' +
          '<div ng-form name="subForm{{$index}}" ng-repeat="validatorName in [\'required\', \'email\']">' +
            '<div af-messages><span af-message-label="{{validatorName}}">Content</span></div>' +
          '</div>' +
        '</form>'), {
        messages: '[ng-form]:eq({0}) [af-messages]'
      });
    });

    it('should validate these as well', function () {
      expect(this.element.messages(0)).toHaveText('Required translation sub form');
      expect(this.element.messages(1)).toHaveText('E-mail translation sub form');
    });
  });

  describe('when there is no messageId', function () {
    beforeEach(function () {
      addSelectors(compileHtml('<form name="userForm"><div af-messages><span af-message-label="{{key}}">Content</span></div></form>'), {
        messages: '[af-messages]',
        label: '[af-message-label]'
      });

      delete this.element.messages().controller('afMessages').messageId;
      this.$scope.key = 'name'; // to trigger watch
      this.$scope.$digest();
    });

    it('should get the label for form', function () {
      expect(this.element).toHaveText('Name translation form');
    });
  });
});
