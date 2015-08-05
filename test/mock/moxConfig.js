angular.extend(moxConfig, {
  translateFilter: function ($provide) {
    var mock = jasmine.createSpy('translateFilter');
    mock.and.callFake(_.identity);
    mox.save($provide, 'translateFilter', mock);
  },
  TranslateService: mox.createMock('TranslateService', ['hasLabel', 'getLabel'])
});
