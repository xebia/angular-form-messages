angular.module('angularFormMessages')
/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afSubmitButton
 * @description
 * The submit button is disabled while $scope.isSubmitting is true. This scope flag is set by the {@link angularFormMessages.directive:afSubmit afSubmit} directive.
 */
  .directive('afSubmitButton', function () {
    return {
      link: function linkFn($scope, elem, attrs) {
        $scope.$watch('isSubmitting', function (newValue) {
          attrs.$set('disabled', newValue ? 'disabled' : undefined);
        });
      }
    };
  });
