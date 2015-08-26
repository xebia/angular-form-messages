/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afMessageLabel
 * @description
 * Translates a validator name to a message.
 */
angular.module('angularFormMessages')
  .directive('afMessageLabel', function (
    $interpolate,
    $log,
    $translate,
    AfMessageService
  ) {
    return {
      restrict: 'A',
      require: ['^form', '^afMessages'],
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
            afMessagesCtrl = ctrls[1],
            fieldName = afMessagesCtrl.fieldName || afMessagesCtrl.fieldNamePrefix,
            specificLabel = $interpolate(formCtrl.$name)($scope) + (fieldName ? '.' + fieldName : '') + '.' + newVal,
            genericLabel = AfMessageService.getGenericLabelPrefix() + newVal;

          $translate(specificLabel)
            .then(translate)
            ['catch'](function () {
              $translate(genericLabel)
                .then(translate)
                ['catch'](function () {
                  $log.warn('Missing label: \'' + specificLabel + '\' (specific) or \'' + genericLabel + '\' (generic)');
                  translate(newVal);
                });
            });
        });
      }
    };
  });
