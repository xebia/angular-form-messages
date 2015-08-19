angular.module('angularFormMessages', []);

angular.module('angularFormMessages').directive('afField', ["$interpolate", "MESSAGE_TYPES", "AfMessageService", function (
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
      function clearErrors() {
        angular.forEach(ngModel.$error, function (isValid, validator) {
          ngModel.$setValidity(validator, true);
        });
      }

      // Update validation on change / blur
      if (triggerOn === 'change') {
        // This also triggers custom directives which may not be able to listen to events
        var ngModelPath = formName + '["' + modelName + '"]';
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

      // Broadcast validation info of the field before submitting
      $scope.$on('validate', function () {
        clearErrors();

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
}]);

angular.module('angularFormMessages')
  .directive('afMessageLabel', ["$interpolate", "$log", "$translate", "AfMessageService", function (
    $interpolate,
    $log,
    $translate,
    AfMessageService
  ) {
    return {
      restrict: 'A',
      require: ['^form', '^afMessages'],
      link: function ($scope, elem, attrs, ctrls) {
        attrs.$observe('afMessageLabel', function (newVal) {
          function translate(translation) {
            elem.html(translation);
          }

          if (!newVal) {
            return;
          }

          var
            formCtrl = ctrls[0],
            afMessagesCtrl = ctrls[1],
            specificLabel = $interpolate(formCtrl.$name)($scope) + '.' + (afMessagesCtrl.messageId || afMessagesCtrl.messageIdPrefix) + '.' + newVal,
            genericLabel = AfMessageService.getGenericLabelPrefix() + newVal;

          $translate(specificLabel)
            .then(translate)
            .catch(function () {
              $translate(genericLabel)
                .then(translate)
                .catch(function () {
                  $log.warn('Missing label: \'' + specificLabel + '\' (specific) or \'' + genericLabel + '\' (generic)');
                  translate(newVal);
                });
            });
        });
      }
    };
  }]);

angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .constant('SHOW_MULTIPLE', { ALL: true, ONE: false, ONE_PER_MESSAGE_ID: 'ONE_PER_MESSAGE_ID' })
  .provider('AfMessageService', ["MESSAGE_TYPES", "SHOW_MULTIPLE", function (
    MESSAGE_TYPES,
    SHOW_MULTIPLE
  ) {
    var
      genericLabelPrefix,
      scrollToError = true,
      showMultiple = SHOW_MULTIPLE.ALL,
      showSuccess = false,
      triggerOn = 'change';

    this.setGenericLabelPrefix = function (newValue) {
      genericLabelPrefix = newValue;
    };

    this.setScrollToError = function (newValue) {
      scrollToError = newValue;
    };

    this.setShowMultiple = function (newValue) {
      showMultiple = newValue;
    };

    this.setShowSuccess = function (newValue) {
      showSuccess = newValue;
    };

    this.setTriggerOn = function (newValue) {
      triggerOn = newValue;
    };

    this.$get = ["SHOW_MULTIPLE", function (SHOW_MULTIPLE) {

      var messageService = {
        /**
         * Determine the message with the highest severity from a list of messages
         * @param {Object[]} messages
         * @returns {Object} message with the highest severity
         */
        getMostSevereMessage: function (messages) {
          var severityIndex = -1, mostSevereMessage;
          angular.forEach(messages, function (message) {
            var index = MESSAGE_TYPES.indexOf(message.type);
            if (index > severityIndex) {
              severityIndex = index;
              mostSevereMessage = message;
            }
          });
          return mostSevereMessage;
        },
        getMessagesToShow: function (messages) {
          var
            severityIndex = -1,
            result = {};

          if (showMultiple === SHOW_MULTIPLE.ALL) {
            return messages;
          }

          angular.forEach(messages, function (messagesForMessageId, messageId) {

            if (messagesForMessageId.length) {
              var mostSevereMessage = messageService.getMostSevereMessage(messagesForMessageId);
              var index = MESSAGE_TYPES.indexOf(mostSevereMessage.type);
              if (showMultiple === SHOW_MULTIPLE.ONE_PER_MESSAGE_ID) {
                result[messageId] = [mostSevereMessage];
              } else if ((showMultiple === SHOW_MULTIPLE.ONE) && index > severityIndex) {
                severityIndex = index;
                result = {};
                result[messageId] = [mostSevereMessage];
              }
            }
          });

          return result;
        },

        validation: function ($scope, messageId, callback, isMessageIdPrefix) {
          $scope.$on('validation', function (event, validationMessageId, messages) {
            if (validationMessageId === messageId || (isMessageIdPrefix && validationMessageId.indexOf(messageId) === 0)) {
              callback(validationMessageId, messages);
            }
          });
        },

        getGenericLabelPrefix: function () {
          return genericLabelPrefix ? genericLabelPrefix + '.' : '';
        },

        scrollToError: function () {
          return scrollToError;
        },

        showMultiple: function () {
          return showMultiple;
        },

        showSuccess: function () {
          return showSuccess;
        },

        triggerOn: function () {
          return triggerOn;
        }
      };

      return messageService;
    }];
  }]);

angular.module('angularFormMessages')
  .directive('afMessages', function () {
    return {
      scope: true,
      require: 'afMessages',
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, afMessagesCtrl) {
        afMessagesCtrl.messageIdPrefix = attrs.afMessageIdPrefix;
        afMessagesCtrl.messageId = attrs.afMessages || attrs.afMessageId;
      }
    };
  });

angular.module('angularFormMessages').directive('afSubmit', ["$rootScope", "$timeout", "AfMessageService", function (
  $rootScope,
  $timeout,
  AfMessageService
) {

  return {
    require: ['form', 'afSubmit'],
    controller: angular.noop,
    link: {
      pre: function ($scope, elem, attrs, ctrls) {
        var afSubmit = ctrls[1];

        // Settings
        var scrollToError = $scope.$eval(attrs.afScrollToError);
        afSubmit.scrollToError = !!(scrollToError === undefined ? AfMessageService.scrollToError() : scrollToError);
        var showSuccess = $scope.$eval(attrs.afShowSuccess);
        afSubmit.showSuccess = !!(showSuccess === undefined ? AfMessageService.showSuccess() : showSuccess);
        afSubmit.triggerOn = attrs.afTriggerOn;
      }, post: function ($scope, elem, attrs, ctrls) {
        var
          afSubmit = ctrls[1],
          form = ctrls[0];

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

              $timeout(function autoFocusFirstMessage() {
                var firstMessageField = elem[0].querySelector('.ng-invalid[af-field]');
                if (afSubmit.scrollToError && firstMessageField) {
                  firstMessageField.focus();
                }
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
