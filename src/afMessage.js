angular.module('angularFormMessages')
  .directive('afMessage', function () {
    return {
      scope: true,
      require: 'afMessage',
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, afMessageCtrl) {
        afMessageCtrl.messageId = attrs.afMessage || attrs.afMessageId;
      }
    };
  });
