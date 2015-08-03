angular.module('angularFormMessages', []);

angular.module('angularFormMessages').directive('afField', ["$rootScope", "MESSAGE_TYPES", "MessageService", function (
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
       * Clears validation after submit has been called when trigger is "submit"
       */
      function cleanValidation(viewValue) {
        if (submit.triggerOn === 'submit') {
          $rootScope.$broadcast('validation', form.$name + '.' + ngModel.$name, []);
        }
        return viewValue;
      }

      $scope.$watchCollection(form.$name + '["' + ngModel.$name + '"].$error', hasValidationChangedAndDirty);
      $scope.$watch(attrs.afTrigger, validationTrigger);
      ngModel.$parsers.push(cleanValidation);

      $scope.$on('validate', updateValidation);
    }
  };
}]);

angular.module('angularFormMessages')
  .directive('afMessage', ["MessageService", function (
    MessageService
  ) {
    return {
      scope: true,
      require: ['^form', 'afMessage'],
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, ctrls) {
        var formCtrl = ctrls[0];
        var afMessageCtrl = ctrls[1];

        afMessageCtrl.messageId = formCtrl.$name + '.' +  (attrs.afMessage || attrs.afMessageId);
        MessageService.validation(afMessageCtrl.messageId, function (messages) {
          $scope.messages = messages;
        });
      }
    };
  }]);

angular.module('angularFormMessages')
  .directive('afMessageLabel', ["translateFilter", "TranslateService", function (
    translateFilter,
    TranslateService
  ) {
    return {
      restrict: 'A',
      require: '^afMessage',
      link: function ($scope, elem, attrs, afMessageCtrl) {
        attrs.$observe('afMessageLabel', function (newVal) {
          var
            specificLabel = afMessageCtrl.messageId + '.' + newVal,
            genericLabel = newVal,
            translation = TranslateService.hasLabel(specificLabel) ? translateFilter(specificLabel) : translateFilter(genericLabel);

          elem.html(translation === undefined ? newVal : translation);
        });
      }
    };
  }]);

angular.module('angularFormMessages').directive('afSubmit', ["$rootScope", "MessageService", function (
  $rootScope,
  MessageService
) {

  return {
    require: ['form', 'afSubmit'],
    controller: function afSubmitController() {
    },
    link: function ($scope, elem, attrs, ctrls) {
      var
        form = ctrls[0],
        submit = ctrls[1];

      function isPromise(obj) {
        return angular.isObject(obj) && typeof (obj.then) === 'function';
      }

      function doSubmit(event) {
        event.preventDefault();

        $scope.$broadcast('validate');
        $scope.$apply(function () {

          function processErrors(result) {
            angular.forEach(result.validation, function (messages, messageId) {
              $rootScope.$broadcast('validation', messageId, messages, MessageService.determineMessageType(messages));
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

      // Settings
      submit.triggerOn = attrs.afTriggerOn || 'change';
      $scope.$watch(attrs.afShowSuccess, function (newVal) {
        submit.showSuccess = !!newVal;
      });
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
