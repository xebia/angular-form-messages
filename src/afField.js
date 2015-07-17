angular.module('angularFormMessages').directive('afField', function () {
  return {
    require: ['ngModel', '^afFieldWrap', '^afSubmit', '^form'],
    scope: {
      afTrigger: '='
    },
    link: function linkFn($scope, elem, attrs, ctrls) {
      var ngModel = ctrls[0];
      var fieldWrap = ctrls[1];
      var submit = ctrls[2];
      var form = ctrls[3];

      $scope[form.$name] = form;

      function hasValidationChangedAndDirty() {
        if (ngModel.$dirty && submit.triggerOn === 'change') {
          updateValidation();
        }
      }

      function validationTrigger(newVal, oldVal) {
        if (oldVal !== newVal) {
          updateValidation();
        }
      }

      function updateValidation() {
        ngModel.$validate();
        var errors = [];
        var errorKeys = Object.keys(ngModel.$error);
        angular.forEach(errorKeys, function (key) {
          errors.push(key);
        });
        submit.validate(fieldWrap.modelPath, errors);
      }

      function cleanValidation(viewValue) {
        if (submit.triggerOn === 'submit') {
          submit.validate(fieldWrap.modelPath, []);
        }
        return viewValue;
      }

      $scope.$watchCollection(form.$name + '["' + ngModel.$name + '"].$error', hasValidationChangedAndDirty);
      $scope.$watch('afTrigger', validationTrigger);
      ngModel.$parsers.push(cleanValidation);

      $scope.$on('validate', updateValidation);
    }
  };
});
