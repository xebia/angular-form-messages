angular.module('angularFormMessages', []);

angular.module('angularFormMessages').directive('afField', ["$rootScope", "MESSAGE_TYPES", "MessageService", function (
  $rootScope,
  MESSAGE_TYPES,
  MessageService
) {
  return {
    //priority: 100,
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
        triggerOn = attrs.afTriggerOn || submit.triggerOn || 'change',
        isPristineAfterSubmit;

      /**
       * Collects validation info from ngModel and afField and broadcasts a validation event
       */
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

        $rootScope.$broadcast('validation', form.$name + '.' + ngModel.$name, messages, MessageService.determineMessageType(messages));
      }

      /**
       * Make this field clean again
       */
      function clearErrors() {
        angular.forEach(ngModel.$error, function (isValid, validator) {
          ngModel.$setValidity(validator, true);
        });
      }

      /**
       * Update validation on change / blur
       */
      if (triggerOn === 'change') {
        // This also triggers custom directives which may not be able to listen to events
        ngModel.$viewChangeListeners.push(updateValidation);
      } else if (triggerOn === 'blur') {
        elem.on('blur', function () {
          $scope.$apply(updateValidation);
        });
      }

      /**
       * Update validation on defined trigger
       */
      $scope.$watch(attrs.afTrigger, function validationTrigger(newVal, oldVal) {
        if (oldVal !== newVal) {
          updateValidation();
        }
      });

      /**
       * Clears validation after submit has been called and the user edits the field
       */
      ngModel.$viewChangeListeners.push(function cleanValidationAfterSubmitChange() {
        if (isPristineAfterSubmit) {
          isPristineAfterSubmit = false;
          clearErrors();
        }
      });

      /**
       * Validate the field before submitting
       */
      $scope.$on('validate', function () {
        clearErrors();
        ngModel.$validate();
        updateValidation();
      });

      /**
       * Set validity of this field after submitting
       */
      $scope.$on('setValidity', function setValidity(event, messageId, messages) {
        if (messageId === form.$name + '.' + ngModel.$name) {
          isPristineAfterSubmit = true;
          angular.forEach(messages, function (message) {
            afField.setMessageDetails(message.message, message.type);
            ngModel.$setValidity(message.message, false);
          });
        }
      });
    }
  };
}]);

angular.module('angularFormMessages')
  .directive('afMessage', ["MessageService", function (
    MessageService
  ) {
    return {
      scope: true,
      require: '^form',
      link: function linkFn($scope, elem, attrs, formCtrl) {
        var messageId = attrs.afMessage || attrs.afMessageId;
        MessageService.validation(formCtrl.$name + '.' + messageId, function (messages) {
          $scope.messages = messages;
        });
      }
    };
  }]);

angular.module('angularFormMessages').directive('afSubmit', ["$rootScope", function (
  $rootScope
) {

  return {
    require: ['form', 'afSubmit'],
    controller: angular.noop,
    link: {
      pre: function ($scope, elem, attrs, ctrls) {
        var submit = ctrls[1];

        // Settings
        submit.triggerOn = attrs.afTriggerOn;
        $scope.$watch(attrs.afShowSuccess, function (newVal) {
          submit.showSuccess = !!newVal;
        });
      }, post: function ($scope, elem, attrs, ctrls) {
        var form = ctrls[0];

        function isPromise(obj) {
          return angular.isObject(obj) && typeof (obj.then) === 'function';
        }

        function doSubmit(event) {
          event.preventDefault();

          $scope.$broadcast('validate');
          $scope.$apply(function () {

            function processErrors(result) {
              angular.forEach(result.validation, function (validations, formName) {
                angular.forEach(validations, function (messages, messageId) {
                  $rootScope.$broadcast('setValidity', formName + '.' + messageId, messages);
                });
              });
            }

            if (!form.$valid) {
              return;
            }

            var callbackResult = $scope.$eval(attrs.afSubmit);
            if (isPromise(callbackResult)) {
              $scope.isSubmitting = true;
              callbackResult
                .catch(processErrors)
                ['finally'](function () {
                $scope.isSubmitting = false;
              });
            }
          });
        }

        elem.on('submit', doSubmit);
      }
    }
  };
}]);

angular.module('angularFormMessages').directive('afSubmitButton', function () {
  return {
    link: function linkFn($scope, elem, attrs) {
      $scope.$watch('isSubmitting', function (newValue) {
        attrs.$set('disabled', newValue ? 'disabled' : undefined);
      });
    }
  };
});

angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .factory('MessageService', ["$rootScope", "MESSAGE_TYPES", function (
    $rootScope,
    MESSAGE_TYPES
  ) {
    return {
      /**
       * Determine the message type with the highest severity from a list of messages
       * @param {Object[]} messages
       * @returns {string} message type with the highest severity
       */
      determineMessageType: function (messages) {
        var severityIndex = -1;
        angular.forEach(messages, function (message) {
          var index = MESSAGE_TYPES.indexOf(message.type);
          if (index > severityIndex) {
            severityIndex = index;
          }
        });
        return severityIndex === -1 ? undefined : MESSAGE_TYPES[severityIndex];
      },

      validation: function (messageId, callback) {

        $rootScope.$on('validation', function (event, validationMessageId, messages, messageType) {
          if (validationMessageId === messageId) {
            callback(messages, messageType);
          }
        });
      }
    };
  }]);
