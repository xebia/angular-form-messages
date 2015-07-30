angular.module('angularFormMessagesBootstrap')
  .directive('afFeedback', function (
    MESSAGE_TYPES,
    MessageService
  ) {
    return {
      require: ['afFeedback', '^afSubmit', '^form'],
      controller: angular.noop,
      link: function ($scope, elem, attrs, ctrls) {
        var
          afFeedbackCtrl = ctrls[0],
          afSubmitCtrl = ctrls[1],
          formCtrl = ctrls[2];

        afFeedbackCtrl.messageId = attrs.afFeedback || attrs.afMessageId;

        MessageService.validation(formCtrl.$name + '.' + afFeedbackCtrl.messageId, function (messages) {
          if (messages.length || afSubmitCtrl.showSuccess) {
            attrs.$addClass('has-feedback');
          } else {
            attrs.$removeClass('has-feedback');
          }
        });
      }
    };
  });