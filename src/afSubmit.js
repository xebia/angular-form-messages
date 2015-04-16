angular.module('angularFormMessages').directive('afSubmit', function ($parse, $rootScope) {
  var trigger; // FIXME: This is a closure which we don't want

  return {
    scope: false,
    require: 'form',
    controller: function() {
      this.trigger = function () {
        return trigger;
      };
    },
    link: function ($scope, elem, attrs, formController) {
      function isPromise(obj) {
        return angular.isObject(obj) && typeof (obj.then) === 'function';
      }

      function doSubmit(event) {
        $rootScope.$broadcast('validate');
        if (formController.$invalid) { // TODO: geen gebruik maken van angular form validatie?
          return;
        }

        $scope.$apply(function () {
          function processErrors(result) {
            angular.forEach(result.validation, function (error, modelPath) {
              $rootScope.$broadcast('afValidation', modelPath, error.isValid, error.message)
            });
          }

          var submitCallback = $parse(attrs.afSubmit);
          var callbackResult = submitCallback($scope, { $event: event });
          if (isPromise(callbackResult)) {
            callbackResult
              .catch(processErrors);
          }
        });
      }

      $scope.trigger = attrs.afTrigger || 'change';
      elem.on('submit', doSubmit);
    }
  };

});