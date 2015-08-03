angular.module('angularFormMessages')
  .directive('afMessageLabel', function (
    translateFilter,
    TranslateService
  ) {
    return {
      restrict: 'A',
      require: '^afMessage',
      link: function ($scope, elem, attrs, afMessageCtrl) {
        attrs.$observe('afMessageLabel', function (newVal) {
          var
            specificLabel = afMessageCtrl.messageId + '.' + newVal,
            genericLabel = newVal,
            translation = TranslateService.hasLabel(specificLabel) ? translateFilter(specificLabel) : translateFilter(genericLabel);

          elem.html(translation === undefined ? newVal : translation);
        });
      }
    };
  });
