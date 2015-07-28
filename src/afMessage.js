angular.module('angularFormMessages')
  .directive('afMessage', function (
    MessageService
  ) {
    return {
      scope: true,
      link: function linkFn($scope, elem, attrs) {
        MessageService.validation(attrs.afMessage, function (messages) {
          $scope.messages = messages;
        });
      }
    };
  });
