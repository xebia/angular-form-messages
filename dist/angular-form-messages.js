angular.module('angularFormMessages').directive('afError', function () {
  return {
    templateUrl: 'templates/error.html',
    require: '^afFieldWrap',
    scope: true,
    link: function linkFn($scope, elem, attrs, ctrl) {
      $scope.$on('validation', function (event, messageId, errors) {
        if (messageId === ctrl.messageId) {
          $scope.errors = errors;
        }
      });
    }
  };
});

angular.module('angularFormMessages').directive('afField', function () {
  return {
    priority: 100,
    require: ['ngModel', '^afFieldWrap', '^afSubmit', '^form'],
    link: function linkFn($scope, elem, attrs, ctrls) {
      var ngModel = ctrls[0];
      var fieldWrap = ctrls[1];
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

      function updateValidation() {
        ngModel.$validate();
        var errors = [];
        var errorKeys = Object.keys(ngModel.$error);
        angular.forEach(errorKeys, function (key) {
          errors.push(key);
        });
        submit.validate(fieldWrap.messageId, errors);
      }

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
        for (var key in this.validations) {
          var errors = this.validations[key];
          if (errors.length) {
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

      submit.triggerOn = attrs.afTriggerOn || 'change';
      elem.on('submit', doSubmit);
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
