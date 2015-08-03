describe('the afMessageLabel directive', function () {
  beforeEach(function () {
    mox
      .module('angularFormMessages')
      .mockServices(
        'translateFilter',
        'TranslateService'
      )
      .setupResults(function () {
        return {
          TranslateService: { hasLabel: true },
          translateFilter: function (key) {
            return {
              'userForm.user.email.email': 'E-mail translation',
              required: 'Required translation'
            }[key];
          }
        };
      })
      .run();

    createScope();
    compileHtml('<form name="userForm"><div af-message="user.email"><span af-message-label="{{key}}"></span></div></form>');
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
});
