angular.module('angularFormMessages').directive('afSubmit', function (
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
});
