angular.module('angularFormMessages')
  .directive('afMessage', function (
    AfMessageService
  ) {
    return {
      scope: true,
      require: ['^form', 'afMessage'],
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, ctrls) {
        var formCtrl = ctrls[0];
        var afMessageCtrl = ctrls[1];

        afMessageCtrl.messageId = formCtrl.$name + '.' +  (attrs.afMessage || attrs.afMessageId);
        AfMessageService.validation(afMessageCtrl.messageId, function (messages) {
          $scope.messages = messages;
        });
      }
    };
  });
