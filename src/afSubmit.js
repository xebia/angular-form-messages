angular.module('angularFormMessages').directive('afSubmit', function () {

  return {
    require: 'afSubmit',
    controller: function afSubmitController($scope) {
      this.validations = {};

      this.validate = function (modelPath, errors) {
        this.validations[modelPath] = errors;
        $scope.validations = this.validations; // Temp
        $scope.$broadcast('validation', modelPath, errors);
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
            angular.forEach(result.validation, function (errors, modelPath) {
              submit.validate(modelPath, errors);
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
