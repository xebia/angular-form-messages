angular.module('angularFormMessages')
  .directive('afMessage', function (
    MessageService
  ) {
    return {
      scope: true,
      link: function linkFn($scope, elem, attrs) {
        MessageService.validation(attrs.afMessage || attrs.afMessageId, function (messages) {
          $scope.messages = messages;
        });
      }
    };
  });
