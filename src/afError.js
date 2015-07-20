angular.module('angularFormMessages').directive('afError', function () {
  return {
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, ctrl) {
      $scope.$on('validation', function (event, messageId, errors) {
        if (messageId === ctrl.messageId) {
          $scope.errors = errors;
        }
      });
    }
  };
});
