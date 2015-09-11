angular.module('angularFormMessages').directive('afField', function (
  $interpolate,
  MESSAGE_TYPES,
  AfMessageService
) {
  return {
    require: ['ngModel', 'afField', '^afSubmit', '^form'],
    controller: function () {
      function setMessageDetails(type) {
        return function (key) {
          ctrl.$messages[key] = {
            type: type
          };
        };
      }

      var ctrl = this;

      // Object for storing extra message data such as message type
      this.$messages = {};

      this.setMessageDetails = function (key, type) {
        setMessageDetails(type)(key);
      };
      this.setErrorDetails = setMessageDetails(MESSAGE_TYPES[3]);
      this.setWarningDetails = setMessageDetails(MESSAGE_TYPES[2]);
      this.setInfoDetails = setMessageDetails(MESSAGE_TYPES[1]);
      this.setSuccessDetails = setMessageDetails(MESSAGE_TYPES[0]);
    },
    link: function linkFn($scope, elem, attrs, ctrls) {
      var
        ngModel = ctrls[0],
        afField = ctrls[1],
        submit = ctrls[2],
        formName = $interpolate(ctrls[3].$name)($scope),
        modelName = $interpolate(ngModel.$name)($scope),
        triggerOn = attrs.afTriggerOn || submit.triggerOn || AfMessageService.triggerOn(),
        isPristineAfterSubmit;

      // Collects validation info from ngModel and afField and broadcasts a validation event
      function updateValidation() {
        var messages = [];

        angular.forEach(ngModel.$error, function (isValid, key) {
          // The message type is stored in afField.$messages when for example afField.setError has been called, additional to ngModel.$setValidity
          if (isValid) {
            messages.push({
              message: key,
              type: (afField.$messages[key] && afField.$messages[key].type) || MESSAGE_TYPES[3]
            });
          }
        });

        $scope.$emit('validation', modelName, messages);
      }

      // Make this field clean again
      function clearMessages() {
        angular.forEach(ngModel.$error, function (isValid, validator) {
          ngModel.$setValidity(validator, true);
        });
      }

      // Update validation on change / blur
      if (triggerOn === 'change') {
        // This also triggers custom directives which may not be able to listen to events
        $scope.$watch(function () {
          // We cannot check $scope.formName.fieldName because that always refers to the lastest ngModelCtrl for the bound model
          // @see https://github.com/angular/angular.js/issues/7647
          return [ngModel.$error, ngModel.$dirty];
        }, function (newVal) {
          if (newVal[1]) {
            updateValidation();
          }
        }, true);
      } else if (triggerOn === 'blur') {
        elem.on('blur', function () {
          $scope.$apply(updateValidation);
        });
      }

      // Update validation on defined trigger
      $scope.$watch(attrs.afTrigger, function validationTrigger(newVal, oldVal) {
        if (oldVal !== newVal) {
          updateValidation();
        }
      });

      // Clears validation after submit has been called and the user edits the field
      ngModel.$viewChangeListeners.push(function cleanValidationAfterSubmitChange() {
        if (isPristineAfterSubmit) {
          isPristineAfterSubmit = false;
          clearMessages();
        }
      });

      // Broadcast validation info of the field before submitting
      $scope.$on('validate', function () {
        clearMessages();

        // Workaround to trigger the validation pipeline of Angular 1.2
        if (ngModel.$validate) {
          ngModel.$validate();
        } else {
          ngModel.$setViewValue(ngModel.$viewValue);
        }
        updateValidation();
      });

      // Set validity of this field after submitting
      $scope.$on('setValidity', function setValidity(event, messageId, messages) {
        if (messageId === formName + '.' + modelName) {
          isPristineAfterSubmit = true;
          angular.forEach(messages, function (message) {
            afField.setMessageDetails(message.message, message.type);
            ngModel.$setValidity(message.message, false);
          });
        }
      });
    }
  };
});
