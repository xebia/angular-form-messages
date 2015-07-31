angular.module('angularFormMessages').directive('afSubmit', function (
  $rootScope
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

      // Settings
      submit.triggerOn = attrs.afTriggerOn || 'change';
      $scope.$watch(attrs.afShowSuccess, function (newVal) {
        submit.showSuccess = !!newVal;
      });
    }
  };

});
