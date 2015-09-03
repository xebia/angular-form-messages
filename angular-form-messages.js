/**
 * @ngdoc overview
 * @name index
 * @description
 * # Documentation for Angular Form Messages
 *
 * There are two modules. The base module ({@link angularFormMessages}) and a Bootstrap extension ({@link angularFormMessagesBootstrap}).
 * Feel free to add both js files to your app in a script tag.
 *
 * Angular Form Messages can be used with Angular 1.2 and up.
 *
 * ## Why?
 * When you make a form in Angular, you usually add validation messages using `ng-show="formName.fieldName.$dirty && formName.fieldName.$invalid"`.
 *
 * Since Angular 1.3, showing messages has been a lot easier, but this "dirty and invalid" boilerplate is still required to have control over showing and hiding messages.
 *
 * The addition of `ngModelOptions` give you freedom to set model triggers (ie. on blur), but this still requires some boilerplate code every form element.
 * Nevertheless this functionality is not available in Angular 1.2.
 *
 * Angular Form Messages helps you with managing form messages by doing some simple configuration.
 *
 * ## How it works
 *
 * When a field becomes invalid, a validation event is emitted. Event listeners that are subscribed to the field that broadcasts this event are called.
 *
 * The result is that the {@link angularFormMessagesBootstrap.directive:afFieldState afFieldState} directive adds a `'has-error'` class,
 * the {@link angularFormmessagesBootstrap.directive:afMessages afMessages} directives shows a message, etc.
 *
 * ## Usage
 *
 * Just make a form like you are used to, with `ng-model`s on the form elements. The form tag and the form elements have `name` attributes.
 *
 * Now you have to add the AFM sauce:
 * 1. Add `af-field` to the form elements.
 * 2. Add `af-submit="submitMethod()"` to the form tag and remove `ng-submit`.
 * 3. Add `af-messages="fieldName"` directives to the places where you want to show messages for certain fields.
 * 4. Add `af-messages` directives to the form to show general form messages.
 *
 * When you also want to show server side messages, the `submitMethod` needs to return a rejecting promise containing:
 * ```
 * {
 *   validation: {
 *     $messages: [{
 *       message: 'This is general message', type: 'ERROR'
 *     }],
 *     formName: {
 *       $messages: [{
 *         message: 'This is general form message', type: 'ERROR'
 *       }],
 *       fieldName1: [
 *         { message: 'This is the first message for fieldName1', type: 'ERROR' },
 *         { message: 'This is the second message for fieldName1', type: 'WARNING' }
 *       ],
 *       fieldName2: [
 *         { message: 'This is the first message for fieldName2', type: 'INFO' },
 *         { message: 'This is the second message for fieldName2', type: 'SUCCESS' }
 *       ],
 *     }
 *   }
 * }
 * ```
 *
 * You can easily add your own custom directives by subscribing to the `validation` event.
 *
 * ## Modules
 *
 * ### {@link angularFormMessages}
 * This module contains the base directives to make Angular Form Messages work. Showing messages when filling in the form,
 * but also when processing messages after submitting.
 *
 * The directives are using the {@link angularFormMessages.service:AfMessageService AfMessageService} util methods.
 * You can inject this service when you are making your own directives.
 *
 * ### {@link angularFormMessagesBootstrap}
 * Additional directives and extensions of the base directives that show feedback icons on the form elements and add `'has-error'` classes to the form wraps.
 */

/**
 * @ngdoc overview
 * @name angularFormMessages
 * @description
 * The Angular Form Messages module. Contains all basic functionality to make Angular Form Messages possible.
 *
 * ## Directives
 * * {@link angularFormMessages.directive:afField afField} - Registering a form element.
 * * {@link angularFormMessages.directive:afMessageLabel afMessageLabel} - Showing a translated message.
 * * {@link angularFormMessages.directive:afMessages afMessages} - Showing messages.
 * * {@link angularFormMessages.directive:afSubmit afSubmit} - Handles the form submit.
 * * {@link angularFormMessages.directive:afSubmitButton afSubmitButton} - Disables the form submit button and sets a flag on the scope while submitting.
 *
 * ## Services
 * * {@link angularFormMessages.service:AfMessageService afMessageService} - Contains all shared utility functions that are used by the directives. The provider does app wide configuration.
 *
 */
angular.module('angularFormMessages', []);

/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afField
 * @description
 * Register a form element with angularFormMessages, so that validation information is broadcasted to other directives
 *
 * @requires angularFormMessages.service:AfMessageService
 * @requires MESSAGE_TYPES (constant)
 * @example
 <example module="angularFormMessages">
 <file name="index.html">
 <div>
 <form name="userForm" af-submit>
   <input ng-model="user.name" name="user.name" af-field required />
 </form>
 Errors: {{userForm['user.name'].$error}}
 </div>
 </file>
 </example>
 */
angular.module('angularFormMessages')
  .directive('afField', ["$interpolate", "MESSAGE_TYPES", "AfMessageService", function (
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
  }]);

/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afMessageLabel
 * @description
 * Translates a validator name to a message.
 *
 * @example
 * <example module="angularFormMessagesBootstrap">
 *   <file name="index.html">
 *     <form name="userForm" af-submit>
 *       <input af-field name="user.name" ng-model="user.name" required />
 *       <div af-messages="user.name"></div>
 *     </form>
 *   </file>
 *   <file name="translate.js">
 *  angular.module('angularFormMessages').factory('$translate', function ($q) {
 *    var translations = {
 *      required: 'This field is required'
 *    };
 *
 *     return function (key) {
 *      return key in translations ? $q.when(translations[key]) : $q.reject(key);
 *    };
 *  });
 *   </file>
 * </example>
 */
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
            fieldName = afMessagesCtrl.fieldName || afMessagesCtrl.fieldNamePrefix,
            specificLabel = $interpolate(formCtrl.$name)($scope) + (fieldName ? '.' + fieldName : '') + '.' + newVal,
            genericLabel = AfMessageService.getGenericLabelPrefix() + newVal;

          $translate(specificLabel)
            .then(translate)
            ['catch'](function () {
              $translate(genericLabel)
                .then(translate)
                ['catch'](function () {
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
/**
 * @ngdoc service
 * @name angularFormMessages.service:AfMessageService
 * @description
 * The provider is used to configure app wide settings:
 * * Label prefix for {@link angularFormMessages.directive:afMessageLabel afMessageLabel}.
 * * Auto focusing the first invalid form element.
 * * Showing multiple errors on a form or form element.
 * * Showing success feedback icon and/or colors on valid form elements.
 * * Validation triggers (change, blur or submit).
 *
 * Furthermore this service contains some utility functions.
 */
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

          angular.forEach(messages, function (messagesForField, fieldName) {

            if (messagesForField.length) {
              var mostSevereMessage = messageService.getMostSevereMessage(messagesForField);
              var index = MESSAGE_TYPES.indexOf(mostSevereMessage.type);
              if (showMultiple === SHOW_MULTIPLE.ONE_PER_MESSAGE_ID) {
                result[fieldName] = [mostSevereMessage];
              } else if ((showMultiple === SHOW_MULTIPLE.ONE) && index > severityIndex) {
                severityIndex = index;
                result = {};
                result[fieldName] = [mostSevereMessage];
              }
            }
          });

          return result;
        },

        validation: function ($scope, fieldName, callback, isFieldNamePrefix) {
          $scope.$on('validation', function (event, validationFieldName, messages) {
            if (validationFieldName === fieldName || (isFieldNamePrefix && validationFieldName.indexOf(fieldName) === 0)) {
              callback(validationFieldName, messages);
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

/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afMessages
 * @description
 * Registers a fieldName so that it can show messages.
 * This directive is supposed to be extended (see {@link angularFormMessagesBootstrap.directive:afMessages afMessages}) to show messages.
 *
 * @scope true
 */
angular.module('angularFormMessages')
  .directive('afMessages', function () {
    return {
      scope: true,
      require: 'afMessages',
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, afMessagesCtrl) {
        afMessagesCtrl.fieldNamePrefix = attrs.afFieldNamePrefix;
        afMessagesCtrl.fieldName = attrs.afMessages || attrs.afFieldName || '';
      }
    };
  });

angular.module('angularFormMessages')
/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afSubmit
 * @description
 * This directive handles the submit event.
 * 1. All existing validations are cleared.
 * 2. The form is checked for client side validations.
 * 3. If valid, the submit callback is being called.
 * When this returns a rejecting promise, validation messages are broadcasted.
 *
 * While submitting, $scope.isSubmitting is set to true.
 */
  .directive('afSubmit', ["$interpolate", "$rootScope", "$timeout", "AfMessageService", function (
    $interpolate,
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
            afSubmitCtrl = ctrls[1],
            formCtrl = ctrls[0],
            formName = $interpolate(formCtrl.$name)($scope);

          function isPromise(obj) {
            return angular.isObject(obj) && typeof (obj.then) === 'function';
          }

          function doSubmit(event) {
            event.preventDefault();

            $scope.$broadcast('validate');
            $scope.$apply(function () {

              function processErrors(result) {
                angular.forEach(result.validation, function (validations, validationFormName) {
                  angular.forEach(validations, function (messages, fieldName) {
                    $rootScope.$broadcast('setValidity', validationFormName + (fieldName === '$messages' ? '' : '.' + fieldName), messages);
                  });
                });

                formCtrl.$setPristine();

                $timeout(function autoFocusFirstMessage() {
                  var firstMessageField = elem[0].querySelector('.ng-invalid[af-field]');
                  if (afSubmitCtrl.scrollToError && firstMessageField) {
                    firstMessageField.focus();
                  }
                });
              }

              if (!formCtrl.$valid) {
                return;
              }

              var callbackResult = $scope.$eval(attrs.afSubmit);
              if (isPromise(callbackResult)) {
                $scope.isSubmitting = true;
                callbackResult
                  ['catch'](processErrors)
                  ['finally'](function () {
                  $scope.isSubmitting = false;
                });
              }
            });
          }

          function clearMessages() {
            angular.forEach(formCtrl.$error, function (isValid, validator) {
              formCtrl.$setValidity(validator, true);
            });

            $scope.$emit('validation', '', []);
          }

          $scope.$watch(formCtrl.$name + '.$dirty', function (newVal, oldVal) {
            if (newVal === true && newVal !== oldVal) {
              clearMessages();
            }
          });
          $scope.$on('validate', clearMessages);

          // Set messages on the form
          $scope.$on('setValidity', function setValidity(event, messageId, messages) {
            if (messageId === formName) {
              // Set errors in event payload
              angular.forEach(messages, function (message) {
                formCtrl.$setValidity(message.message, false);
              });

              $scope.$emit('validation', '', messages);
            }
          });

          elem.on('submit', doSubmit);
        }
      }
    };
  }]);

angular.module('angularFormMessages')
/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afSubmitButton
 * @description
 * The submit button is disabled while $scope.isSubmitting is true. This scope flag is set by the {@link angularFormMessages.directive:afSubmit afSubmit} directive.
 */
  .directive('afSubmitButton', function () {
    return {
      link: function linkFn($scope, elem, attrs) {
        $scope.$watch('isSubmitting', function (newValue) {
          attrs.$set('disabled', newValue ? 'disabled' : undefined);
        });
      }
    };
  });
