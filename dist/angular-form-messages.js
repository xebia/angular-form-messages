angular.module('angularFormMessages').directive('afError', function () {
  return {
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, ctrl) {
      $scope.$on('validation', function (event, messageId, messages) {
        if (messageId === ctrl.messageId) {
          $scope.messages = messages;
        }
      });
    }
  };
});

angular.module('angularFormMessages').directive('afField', function () {
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

      this.setError = setMessage('error');
      this.setWarning = setMessage('warning');
      this.setInfo = setMessage('info');
      this.setSuccess = setMessage('success');
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
            type: (afField.$messages[key] && afField.$messages[key].type) || 'error'
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

angular.module('angularFormMessages', []);

angular.module('angularFormMessages').directive('afSubmit', function () {

  return {
    require: 'afSubmit',
    controller: ["$scope", function afSubmitController($scope) {
      this.validations = {};

      this.validate = function (messageId, errors) {
        this.validations[messageId] = errors;
        $scope.validations = this.validations; // Temp
        $scope.$broadcast('validation', messageId, errors);
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
            angular.forEach(result.validation, function (errors, messageId) {
              submit.validate(messageId, errors);
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

});

angular.module('angularFormMessages').directive('afSubmitButton', function () {
  return {
    link: function linkFn($scope, elem, attrs) {
      $scope.$watch('isSubmitting', function (newValue) {
        attrs.$set('disabled', newValue ? 'disabled' : undefined);
      });
    }
  };
});
