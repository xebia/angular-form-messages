angular.module('angularFormMessagesBootstrap')
  .directive('afFeedback', function (
    MESSAGE_TYPES,
    AfMessageService
  ) {
    return {
      require: ['afFeedback', '^afSubmit'],
      controller: angular.noop,
      link: function ($scope, elem, attrs, ctrls) {
        var
          afFeedbackCtrl = ctrls[0],
          afSubmitCtrl = ctrls[1];

        afFeedbackCtrl.messageId = attrs.afFeedback || attrs.afMessageId;

        AfMessageService.validation($scope, afFeedbackCtrl.messageId, function (messages) {
          if (messages.length || afSubmitCtrl.showSuccess) {
            attrs.$addClass('has-feedback');
          } else {
            attrs.$removeClass('has-feedback');
          }
        });
      }
    };
  });
