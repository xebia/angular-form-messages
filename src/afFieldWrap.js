angular.module('angularFormMessages').directive('afFieldWrap', function () {
  return {
    require: ['afFieldWrap', '^form'],
    controller: function afFieldWrapController() {
    },
    compile: function () {
      return {
        // Use a pre-link function because we want to make sure that the messageId is on the controller before the
        // (post-)link function of the afFieldElements have ran
        pre: function linkFn($scope, elem, attrs, ctrls) {
          var
            fieldWrap = ctrls[0],
            form = ctrls[1];

          fieldWrap.messageId = attrs.afFieldWrap;

          // isolateScope breaks scope inheritance of the formCtrl, so we put the formCtrl on the scope manually
          $scope[form.$name] = form;
        }
      };
    }
  };
});
