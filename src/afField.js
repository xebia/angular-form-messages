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
        submit.validate(fieldWrap.modelPath, ngModel.$valid, Object.keys(ngModel.$error).join(', '));
      }

      function cleanValidation(viewValue) {
        if (submit.trigger === 'submit') {
          submit.validate(fieldWrap.modelPath, true, '');
        }
        return viewValue;
      }

      $scope.$watch(form.$name + '["' + ngModel.$name + '"].$error', hasValidationChanged, true);
      ngModel.$parsers.push(cleanValidation);

      $scope.$on('validate', updateValidation);
    }
  };
});
