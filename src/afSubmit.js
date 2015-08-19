angular.module('angularFormMessages').directive('afSubmit', function (
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

        $scope.$on('validate', function () {
          angular.forEach(formCtrl.$error, function (isValid, validator) {
            formCtrl.$setValidity(validator, true);
          });
        });

        $scope.$on('setValidity', function setValidity(event, messageId, messages) {
          if (messageId === formName) {
            // Set errors in event payload
            angular.forEach(messages, function (message) {
              formCtrl.$setValidity(message.message, false);
            });

            $scope.$emit('validation', undefined, messages);
          }
        });

        elem.on('submit', doSubmit);
      }
    }
  };
});
