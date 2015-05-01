angular.module('angularFormMessages').directive('afFieldWrap', function () {
  return {
    controller: function afFieldWrapController() {
    },
    compile: function () {
      return {
        // Use a pre-link function because we want to make sure that the modelPath is on the controller before the
        // (post-)link function of the afFieldElements have ran
        pre: function linkFn($scope, elem, attrs, fieldWrap) {
          fieldWrap.modelPath = attrs.afModelPath;

          $scope.$on('validation', function onValidation(event, modelPath, isValid) {
            if (modelPath === attrs.afModelPath) {
              //console.log('receive validation', modelPath, isValid);
              elem[(isValid ? 'remove' : 'add') + 'Class']('has-error');
            }
          });
        }
      };
    }
  };
});
