angular.module('angularFormMessagesBootstrap')
  .directive('afFeedback', function (
    MESSAGE_TYPES,
    MessageService
  ) {
    return {
      require: '^afSubmit',
      link: function ($scope, elem, attrs, afSubmitCtrl) {

        MessageService.validation(attrs.afFeedback || attrs.afMessageId, function (messages) {
          if (messages.length || afSubmitCtrl.showSuccess) {
            attrs.$addClass('has-feedback');
          } else {
            attrs.$removeClass('has-feedback');
          }
        });
      }
    };
  });
