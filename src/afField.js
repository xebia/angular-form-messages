angular.module('angularFormMessages').directive('afField', function ($rootScope) {
  return {
    require: 'ngModel',
    link: function linkFn($scope, elem, attrs, ngModel) {

      function hasChanged(value) {
        if (!value || $scope.trigger === 'submit') {
          $rootScope.$broadcast('afValidation', ngModel.$name, true, 'message');
        } else {
          emitValidation();
        }
        return value;
      }

      function emitValidation() {
        ngModel.$validate();
        $rootScope.$broadcast('afValidation', ngModel.$name, ngModel.$valid, 'Client side error message');
      }

      // Model to view
      ngModel.$formatters.push(hasChanged);

      // View to model
      ngModel.$parsers.push(hasChanged);

      $scope.$on('validate', emitValidation);
    }
  };
});
