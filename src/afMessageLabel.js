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
            formFieldValidatorLabel = $interpolate(formCtrl.$name)($scope) + (fieldName ? '.' + fieldName : '') + '.' + newVal,
            fieldValidatorLabel = AfMessageService.getFieldValidatorLabelPrefix() + fieldName + '.' + newVal,
            validatorLabel = AfMessageService.getValidatorLabelPrefix() + newVal;

          $translate(formFieldValidatorLabel)
            .then(translate)
            ['catch'](function () {
              $translate(fieldValidatorLabel)
                .then(translate)
                ['catch'](function () {
                  $translate(validatorLabel)
                    .then(translate)
                    ['catch'](function () {
                      $log.warn('Missing label: \'' + formFieldValidatorLabel + '\' (form, field and validator), \'' + fieldValidatorLabel + '\' (field and validator) or \'' + validatorLabel + '\' (validator)');
                      translate(newVal);
                    });
                });
            });
        });
      }
    };
  });
