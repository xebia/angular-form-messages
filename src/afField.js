angular.module('angularFormMessages').directive('afField', function (
  $rootScope,
  MESSAGE_TYPES,
  AfMessageService
) {
  return {
    priority: 100,
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
        form = ctrls[3],
        triggerOn = attrs.afTriggerOn || submit.triggerOn || AfMessageService.triggerOn(),
        isPristineAfterSubmit;

      // Collects validation info from ngModel and afField and broadcasts a validation event
      function updateValidation() {
        var messages = [];

        angular.forEach(ngModel.$error, function (isValid, key) {
          // For now, the message is just the key
          // The message type is stored in afField.$messages when for example afField.setError has been called, additional to ngModel.$setValidity
          messages.push({
            message: key,
            type: (afField.$messages[key] && afField.$messages[key].type) || MESSAGE_TYPES[3]
          });
        });

        $rootScope.$broadcast('validation', form.$name + '.' + ngModel.$name, messages, AfMessageService.determineMessageType(messages));
      }

      // Make this field clean again
      function clearErrors() {
        angular.forEach(ngModel.$error, function (isValid, validator) {
          ngModel.$setValidity(validator, true);
        });
      }

      // Update validation on change / blur
      if (triggerOn === 'change') {
        // This also triggers custom directives which may not be able to listen to events
        var ngModelPath = form.$name + '["' + ngModel.$name + '"]';
        $scope.$watch('[' + ngModelPath + '.$error, ' + ngModelPath + '.$dirty]', function (newVal, oldVal) {
          if ((newVal[0] !== oldVal[0]) || newVal[1]) {
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
          clearErrors();
        }
      });

      // Validate the field before submitting
      $scope.$on('validate', function () {
        clearErrors();
        ngModel.$validate();
        updateValidation();
      });

      // Set validity of this field after submitting
      $scope.$on('setValidity', function setValidity(event, messageId, messages) {
        if (messageId === form.$name + '.' + ngModel.$name) {
          isPristineAfterSubmit = true;
          angular.forEach(messages, function (message) {
            afField.setMessageDetails(message.message, message.type);
            ngModel.$setValidity(message.message, false);
          });
          updateValidation();
        }
      });
    }
  };
});
