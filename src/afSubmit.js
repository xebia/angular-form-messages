angular.module('angularFormMessages').directive('afSubmit', function (
  $rootScope,
  MessageService
) {

  return {
    require: ['form', 'afSubmit'],
    controller: angular.noop,
    link: {
      pre: function ($scope, elem, attrs, ctrls) {
        var submit = ctrls[1];

        // Settings
        submit.triggerOn = attrs.afTriggerOn;
        var showSuccess = $scope.$eval(attrs.afShowSuccess);
        submit.showSuccess = !!(showSuccess === undefined ? MessageService.showSuccess() : showSuccess);
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
});
