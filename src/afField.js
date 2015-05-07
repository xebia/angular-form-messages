angular.module('angularFormMessages').directive('afField', function () {
  return {
    require: ['ngModel', '^afFieldWrap', '^afSubmit', '^form'],
    link: function linkFn($scope, elem, attrs, ctrls) {
      var ngModel = ctrls[0];
      var fieldWrap = ctrls[1];
      var submit = ctrls[2];
      var form = ctrls[3];

      function hasValidationChanged(newValue, oldValue) {
        if (newValue !== oldValue && submit.trigger === 'change') {
          updateValidation();
        }
      }

      function updateValidation() {
        ngModel.$validate();
        var errors = [];
        var errorKeys = Object.keys(ngModel.$error);
        angular.forEach(errorKeys, function (key) {
          errors.push({ message: key });
        });
        submit.validate(fieldWrap.modelPath, errors);
      }

      function cleanValidation(viewValue) {
        if (submit.trigger === 'submit') {
          submit.validate(fieldWrap.modelPath, []);
        }
        return viewValue;
      }

      $scope.$watch(form.$name + '["' + ngModel.$name + '"].$error', hasValidationChanged, true);
      ngModel.$parsers.push(cleanValidation);

      $scope.$on('validate', updateValidation);
    }
  };
});
