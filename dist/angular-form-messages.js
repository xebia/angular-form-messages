angular.module('angularFormMessages').directive('afField', ["MESSAGE_TYPES", "MessageService", function (
  MESSAGE_TYPES,
  MessageService
) {
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
        submit.validate(fieldWrap.messageId, messages, MessageService.determineMessageType(messages));
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
}]);

angular.module('angularFormMessages').directive('afFieldWrap', function () {
  return {
    require: ['afFieldWrap', '^form'],
    controller: function afFieldWrapController() {
    },
    compile: function () {
      return {
        // Use a pre-link function because we want to make sure that the messageId is on the controller before the
        // (post-)link function of the afFieldElements have ran
        pre: function linkFn($scope, elem, attrs, ctrls) {
          var
            fieldWrap = ctrls[0],
            form = ctrls[1];

          fieldWrap.messageId = attrs.afFieldWrap;

          // isolateScope breaks scope inheritance of the formCtrl, so we put the formCtrl on the scope manually
          $scope[form.$name] = form;
        }
      };
    }
  };
});

angular.module('angularFormMessages')
  .directive('afMessage', function () {
    return {
      require: '^afFieldWrap',
      scope: true,
      link: function linkFn($scope, elem, attrs, afFieldWrapCtrl) {
        $scope.$on('validation', function (event, messageId, messages) {
          if (messageId === afFieldWrapCtrl.messageId) {
            $scope.messages = messages;
          }
        });
      }
    };
  });

angular.module('angularFormMessages', []);
angular.module('angularFormMessagesBootstrap', ['angularFormMessages']);

angular.module('angularFormMessages').directive('afSubmit', ["MessageService", function (
  MessageService
) {

  return {
    require: 'afSubmit',
    controller: ["$scope", function afSubmitController($scope) {
      this.validations = {};

      this.validate = function (messageId, errors, messageType) {
        this.validations[messageId] = errors;
        $scope.validations = this.validations; // Temp
        $scope.$broadcast('validation', messageId, errors, messageType);
      };

      this.isValid = function () {
        for (var messageId in this.validations) {
          var messages = this.validations[messageId];
          if (messages.length) {
            return false;
          }
        }
        return true;
      };

    }],
    link: function ($scope, elem, attrs, submit) {
      function isPromise(obj) {
        return angular.isObject(obj) && typeof (obj.then) === 'function';
      }

      function doSubmit(event) {
        event.preventDefault();

        $scope.$broadcast('validate');
        $scope.$apply(function () {

          function processErrors(result) {
            angular.forEach(result.validation, function (messages, messageId) {
              submit.validate(messageId, messages, MessageService.determineMessageType(messages));
            });
          }

          if (!submit.isValid()) {
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
  .factory('MessageService', ["MESSAGE_TYPES", function (MESSAGE_TYPES) {
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
      }
    };
  }]);

angular.module('angularFormMessages').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/messageDirective.html',
    "<span class=\"glyphicon form-control-feedback\" ng-class=\"icon\" aria-hidden=\"true\" ng-if=\"messageType\"></span>\n" +
    "<span class=\"sr-only\">({{messageType}}))</span>\n" +
    "<div class=\"alert help-block\" ng-class=\"message.alertClass\" ng-style=\"{ 'margin-bottom': $last ? undefined : '0px' }\" role=\"alert\" ng-repeat=\"message in messages track by $index\">\n" +
    "  <span class=\"glyphicon\" ng-class=\"message.icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">{{message.type}}:</span>\n" +
    "  {{message.message}}\n" +
    "</div>\n"
  );

}]);
