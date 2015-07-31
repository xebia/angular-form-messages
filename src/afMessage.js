angular.module('angularFormMessages')
  .directive('afMessage', function (
    MessageService
  ) {
    return {
      scope: true,
      require: '^form',
      link: function linkFn($scope, elem, attrs, formCtrl) {
        var messageId = attrs.afMessage || attrs.afMessageId;
        MessageService.validation(formCtrl.$name + '.' + messageId, function (messages) {
          $scope.messages = messages;
        });
      }
    };
  });
