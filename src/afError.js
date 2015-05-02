angular.module('angularFormMessages').directive('afError', function () {
  return {
    templateUrl: 'templates/error.html',
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, ctrl) {

      $scope.$on('validation', function (event, modelPath, isValid, message) {
        if (modelPath === ctrl.modelPath) {
          $scope.message = isValid ? undefined : message;
        }
      });
    }
  };
});
