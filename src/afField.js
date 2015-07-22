angular.module('angularFormMessages').directive('afField', function (MESSAGE_TYPES) {
  return {
    priority: 100,
    require: ['ngModel', 'afField', '^afFieldWrap', '^afSubmit', '^form'],
    controller: function () {
      function setMessage(type) {
        return function (key) {
          this.$messages[key] = {
            type: type
          };
        };
      }

      // Object for storing extra message data such as message type
      this.$messages = {};

      this.setError = setMessage(MESSAGE_TYPES[3]);
      this.setWarning = setMessage(MESSAGE_TYPES[2]);
      this.setInfo = setMessage(MESSAGE_TYPES[1]);
      this.setSuccess = setMessage(MESSAGE_TYPES[0]);
    },
    link: function linkFn($scope, elem, attrs, ctrls) {
      var ngModel = ctrls[0];
      var afField = ctrls[1];
      var fieldWrap = ctrls[2];
      var submit = ctrls[3];
      var form = ctrls[4];

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

      /*
       * Collects validation info from ngModel and afField and passes it to submit.validate()
       */
      function updateValidation() {
        ngModel.$validate();
        var messages = [];
        var errorKeys = Object.keys(ngModel.$error);

        angular.forEach(errorKeys, function (key) {
          // For now, the message is just the key
          // The message type is stored in afField.$messages when for example afField.setError has been called, additionally to ngModel.$setValidity
          messages.push({
            message: key,
            type: (afField.$messages[key] && afField.$messages[key].type) || MESSAGE_TYPES[3]
          });
        });
        submit.validate(fieldWrap.messageId, messages);
      }

      /**
       * Clears validation after submit has been called when trigger is "submit"
       */
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
