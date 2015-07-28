angular.module('angularFormMessagesBootstrap')
  .directive('fieldState', function (
    MESSAGE_TYPES,
    MessageService
  ) {
    return {
      require: '^afSubmit',
      link: function ($scope, elem, attrs, afSubmitCtrl) {

        MessageService.validation(attrs.fieldState, function (messages, messageType) {
          angular.forEach(MESSAGE_TYPES, function (type) {
            attrs.$removeClass('has-' + type.toLowerCase());
          });
          attrs.$removeClass('has-feedback');

          if (messageType && messages.length === 1) {
            attrs.$addClass('has-' + messageType.toLowerCase());
            attrs.$addClass('has-feedback');
          } else if (afSubmitCtrl.showSuccess) {
            if (!messages.length) {
              attrs.$addClass('has-success');
            }
            attrs.$addClass('has-feedback');
          }
        });
      }
    };
  });
