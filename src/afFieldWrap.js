angular.module('angularFormMessages').directive('afFieldWrap', function () {
  return {
    controller: function afFieldWrapController() {
    },
    compile: function () {
      return {
        // Use a pre-link function because we want to make sure that the messageId is on the controller before the
        // (post-)link function of the afFieldElements have ran
        pre: function linkFn($scope, elem, attrs, fieldWrap) {
          fieldWrap.messageId = attrs.afFieldWrap;
        }
      };
    }
  };
});
