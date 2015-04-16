angular.module('angularFormMessages').directive('afFieldWrap', function () {
  return {
    controller: function () {
    },
    link: function linkFn($scope, elem, attrs) {
      $scope.$on('afValidation', function (event, modelPath, isValid) {
        if (modelPath == attrs.afModelPath) {
          if (isValid) {
            elem.removeClass('has-error');
          } else {
            elem.addClass('has-error');
          }
        };
      });
    }
  };
});
