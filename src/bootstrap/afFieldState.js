angular.module('angularFormMessagesBootstrap')
/**
 * This directive shows the 'has-error', 'has-warning', 'has-info' or 'has-success' when there is one message on the field.
 * Where there are multiple messages and multiple messages are shown, no class is added.
 * When there is no message (the field is valid) and showSuccess is true, show the 'has-success' class.
 */
  .directive('afFieldState', function (
    AfMessageService,
    MESSAGE_TYPES
  ) {
    return {
      require: '^afSubmit',
      link: function ($scope, elem, attrs, afSubmitCtrl) {
        var messageId = attrs.afFieldState || attrs.afMessageId;

        AfMessageService.validation($scope, messageId, function (messages, messageType) {
          angular.forEach(MESSAGE_TYPES, function (type) {
            attrs.$removeClass('has-' + type.toLowerCase());
          });

          if (messages.length) {
            if (!(AfMessageService.showMultiple() && messages.length > 1)) {
              attrs.$addClass('has-' + messageType.toLowerCase());
            }
          } else if (afSubmitCtrl.showSuccess) {
            attrs.$addClass('has-success');
          }
        });
      }
    };
  });
