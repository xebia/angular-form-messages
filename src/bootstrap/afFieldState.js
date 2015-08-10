angular.module('angularFormMessagesBootstrap')
/**
 * This directive shows the 'has-error', 'has-warning', 'has-info' or 'has-success' when there is one message on the field.
 * Where there are multiple messages, no class is added.
 * When there is no message (the field is valid) and showSuccess is true, show the 'has-success' class.
 */
  .directive('afFieldState', function (
    MESSAGE_TYPES,
    AfMessageService
  ) {
    return {
      require: ['^afSubmit', '^form'],
      link: function ($scope, elem, attrs, ctrls) {
        var
          afSubmitCtrl = ctrls[0],
          formCtrl = ctrls[1],
          messageId = attrs.afFieldState || attrs.afMessageId;

        AfMessageService.validation(formCtrl.$name + '.' + messageId, function (messages, messageType) {
          angular.forEach(MESSAGE_TYPES, function (type) {
            attrs.$removeClass('has-' + type.toLowerCase());
          });

          if (messageType && messages.length === 1) {
            attrs.$addClass('has-' + messageType.toLowerCase());
          } else if (afSubmitCtrl.showSuccess && !messages.length) {
            attrs.$addClass('has-success');
          }
        });
      }
    };
  });
