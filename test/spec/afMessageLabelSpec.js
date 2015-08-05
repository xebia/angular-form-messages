describe('the afMessageLabel directive', function () {
  var $log;

  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices(
        'MessageService',
        'translateFilter',
        'TranslateService'
      )
      .setupResults(function () {
        return {
          MessageService: {
            getGenericLabelPrefix: 'prefix.'
          },
          TranslateService: { hasLabel: true },
          translateFilter: function (key) {
            return {
              'userForm.user.email.email': 'E-mail translation',
              'prefix.required': 'Required translation'
            }[key];
          }
        };
      })
      .run();

    createScope();
    compileHtml('<form name="userForm"><div af-message="user.email"><span af-message-label="{{key}}"></span></div></form>');
    $log = mox.inject('$log');
    spyOn($log, 'warn');
  });

  it('should replace the contents of the element with the field specific translation if this exists', function () {
    this.$scope.key = 'email';
    this.$scope.$digest();
    expect(this.element).toHaveText('E-mail translation');
  });

  it('should replace the contents of the element with the generic translation if this exists', function () {
    mox.get.TranslateService.hasLabel.and.returnValue(false);
    this.$scope.key = 'required';
    this.$scope.$digest();
    expect(this.element).toHaveText('Required translation');
  });

  it('should show the key if the generic translation does not exist', function () {
    this.$scope.key = 'specific not existing';
    this.$scope.$digest();
    expect(this.element).toHaveText('specific not existing');

    mox.get.TranslateService.hasLabel.and.returnValue(false);

    this.$scope.key = 'generic not existing';
    this.$scope.$digest();
    expect(this.element).toHaveText('generic not existing');
  });

  it('should log a warning when the translations do not exist', function () {
    this.$scope.key = 'not-existing';
    this.$scope.$digest();
    expect($log.warn).toHaveBeenCalledWith('Missing label: \'userForm.user.email.not-existing\' (specific) or \'prefix.not-existing\' (generic)');
  });
});