angular.module('angularFormMessages').directive('afError', function () {
  return {
    templateUrl: 'templates/error.html',
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, afFieldWrapCtrl) {
      $scope.$on('validation', function (event, messageId, errors) {
        if (messageId === afFieldWrapCtrl.messageId) {
          $scope.errors = errors;
        }
      });
    }
  };
});
