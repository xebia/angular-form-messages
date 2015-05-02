angular.module('angularFormMessages').directive('afSubmit', function () {

  return {
    scope: false,
    require: 'afSubmit',
    controller: function afSubmitController($scope) {
      this.validations = {};

      this.validate = function (modelPath, isValid, message) {
        this.validations[modelPath] = {
          isValid: isValid,
          message: message
        };
        $scope.validations = this.validations; // Temp
        $scope.$broadcast('validation', modelPath, isValid, message);
      };

      this.isValid = function () {
        var isValid = true;
        angular.forEach(this.validations, function (validation) {
          if (!validation.isValid) {
            isValid = false;
            return;
          }
        });
        return isValid;
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

          if (!submit.isValid()) {
            return;
          }

          function processErrors(result) {
            angular.forEach(result.validation, function (error, modelPath) {
              submit.validate(modelPath, error.isValid, error.message);
            });
          }

          var callbackResult = $scope.$eval(attrs.afSubmit);
          if (isPromise(callbackResult)) {
            callbackResult
              .catch(processErrors);
          }
        });
      }

      submit.trigger = attrs.afTrigger || 'change';
      elem.on('submit', doSubmit);
    }
  };

});
