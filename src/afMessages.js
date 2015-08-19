angular.module('angularFormMessages')
  .directive('afMessages', function () {
    return {
      scope: true,
      require: 'afMessages',
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, afMessagesCtrl) {
        afMessagesCtrl.fieldNamePrefix = attrs.afFieldNamePrefix;
        afMessagesCtrl.fieldName = attrs.afMessages || attrs.afFieldName;
      }
    };
  });
