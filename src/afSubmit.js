angular.module('angularFormMessages').directive('afSubmit', function () {

  return {
    require: 'afSubmit',
    controller: function afSubmitController($scope) {
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

    },
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
