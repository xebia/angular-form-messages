angular.module('angularFormMessages')
  .directive('afMessage', function () {
    return {
      scope: true,
      link: function linkFn($scope, elem, attrs) {
        $scope.$on('validation', function (event, messageId, messages) {
          if (messageId === attrs.afMessage) {
            $scope.messages = messages;
          }
        });
      }
    };
  });
