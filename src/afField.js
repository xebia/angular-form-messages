angular.module('angularFormMessages').directive('afField', function () {
  return {
    priority: 100,
    require: ['ngModel', '^afFieldWrap', '^afSubmit', '^form'],
    link: function linkFn($scope, elem, attrs, ctrls) {
      var ngModel = ctrls[0];
      var fieldWrap = ctrls[1];
      var submit = ctrls[2];
      var form = ctrls[3];

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
        var messages = [];
        var errorKeys = Object.keys(ngModel.$error);
        angular.forEach(errorKeys, function (key) {
          // For now, the message is just the key and the message type is always 'error'
          messages.push({ message: key, type: 'error' });
        });
        submit.validate(fieldWrap.messageId, messages);
      }

      function cleanValidation(viewValue) {
        if (submit.triggerOn === 'submit') {
          submit.validate(fieldWrap.messageId, []);
        }
        return viewValue;
      }

      $scope.$watchCollection(form.$name + '["' + ngModel.$name + '"].$error', hasValidationChangedAndDirty);
      $scope.$watch(attrs.afTrigger, validationTrigger);
      ngModel.$parsers.push(cleanValidation);

      $scope.$on('validate', updateValidation);
    }
  };
});
