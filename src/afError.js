angular.module('angularFormMessages').directive('afError', function () {
  return {
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, afFieldWrapCtrl) {
      $scope.$on('validation', function (event, messageId, messages) {
        if (messageId === afFieldWrapCtrl.messageId) {
          $scope.messages = messages;
        }
      });
    }
  };
});
