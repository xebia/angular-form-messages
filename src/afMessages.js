angular.module('angularFormMessages')
  .directive('afMessages', function () {
    return {
      scope: true,
      require: 'afMessages',
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, afMessagesCtrl) {
        afMessagesCtrl.messageIdPrefix = attrs.afMessageIdPrefix;
        afMessagesCtrl.messageId = attrs.afMessages || attrs.afMessageId;
      }
    };
  });
