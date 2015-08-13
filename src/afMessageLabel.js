angular.module('angularFormMessages')
  .directive('afMessageLabel', function (
    $interpolate,
    $log,
    $translate,
    AfMessageService
  ) {
    return {
      restrict: 'A',
      require: ['^form', '^afMessage'],
      link: function ($scope, elem, attrs, ctrls) {
        attrs.$observe('afMessageLabel', function (newVal) {
          function translate(translation) {
            elem.html(translation);
          }

          if (!newVal) {
            return;
          }

          var
            formCtrl = ctrls[0],
            afMessageCtrl = ctrls[1],
            specificLabel = $interpolate(formCtrl.$name)($scope) + '.' + (afMessageCtrl.messageId || afMessageCtrl.messageIdStart) + '.' + newVal,
            genericLabel = AfMessageService.getGenericLabelPrefix() + newVal;

          $translate(specificLabel)
            .then(translate)
            .catch(function () {
              $translate(genericLabel)
                .then(translate)
                .catch(function () {
                  $log.warn('Missing label: \'' + specificLabel + '\' (specific) or \'' + genericLabel + '\' (generic)');
                  translate(newVal);
                });
            });
        });
      }
    };
  });
