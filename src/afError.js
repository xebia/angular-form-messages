angular.module('angularFormMessages').directive('afError', function () {
  return {
    templateUrl: 'templates/error.html',
    scope: true,
    link: function linkFn($scope, elem, attrs) {

      $scope.$on('afValidation', function (event, modelPath, isValid, message) {
        if (modelPath === attrs.afModelPath) {
          $scope.message = isValid ? undefined : message;
        }
      });
    }
  };
});
