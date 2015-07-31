angular.module('angularFormMessages').directive('afField', function (
  $rootScope,
  MESSAGE_TYPES,
  MessageService
) {
  return {
    priority: 100,
    require: ['ngModel', 'afField', '^afSubmit', '^form'],
    controller: function () {
      function setMessage(type) {
        return function (key) {
          ctrl.$messages[key] = {
            type: type
          };
        };
      }

      var ctrl = this;

      // Object for storing extra message data such as message type
      this.$messages = {};

      this.setMessage = function (key, type) {
        setMessage(type)(key);
      };
      this.setError = setMessage(MESSAGE_TYPES[3]);
      this.setWarning = setMessage(MESSAGE_TYPES[2]);
      this.setInfo = setMessage(MESSAGE_TYPES[1]);
      this.setSuccess = setMessage(MESSAGE_TYPES[0]);
    },
    link: function linkFn($scope, elem, attrs, ctrls) {
      var
        ngModel = ctrls[0],
        afField = ctrls[1],
        submit = ctrls[2],
        form = ctrls[3],
        isPristineAfterSubmit;

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
          // The message type is stored in afField.$messages when for example afField.setError has been called, additional to ngModel.$setValidity
          messages.push({
            message: key,
            type: (afField.$messages[key] && afField.$messages[key].type) || MESSAGE_TYPES[3]
          });
        });

        $rootScope.$broadcast('validation', form.$name + '.' + ngModel.$name, messages, MessageService.determineMessageType(messages));
      }

      /**
       * Set messages etc on the fields, without setting the validity.
       * This is to make sure that we can resubmit the form without client side invalidation
       */
      function setValidity(event, messageId, messages) {
        if (messageId === form.$name + '.' + ngModel.$name) {
          isPristineAfterSubmit = true;
          angular.forEach(messages, function (message) {
            afField.setMessage(message.message, message.type);
            ngModel.$setValidity(message.message, false);
          });
        }
      }

      /**
       * Clears validation after submit has been called and the user edits the field
       */
      function cleanValidationAfterSubmitChange() {
        if (isPristineAfterSubmit) {
          isPristineAfterSubmit = false;
          angular.forEach(ngModel.$error, function (validation, validator) {
            ngModel.$setValidity(validator, true);
          });
        }
      }

      $scope.$watchCollection(form.$name + '["' + ngModel.$name + '"].$error', hasValidationChangedAndDirty);
      $scope.$watch(attrs.afTrigger, validationTrigger);
      ngModel.$viewChangeListeners.push(cleanValidationAfterSubmitChange);

      $scope.$on('validate', updateValidation);
      $scope.$on('setValidity', setValidity);
    }
  };
});
