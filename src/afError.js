angular.module('angularFormMessages').directive('afError', function () {
  return {
    templateUrl: 'templates/error.html',
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, ctrl) {
      $scope.$on('validation', function (event, modelPath, errors) {
        if (modelPath === ctrl.modelPath) {
          $scope.errors = errors;
        }
      });
    }
  };
});
