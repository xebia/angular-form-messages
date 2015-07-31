angular.module('angularFormMessagesBootstrap')
  .directive('afMessage', function (
    MESSAGE_TYPES,
    MessageService
  ) {
    var icons = {
      ERROR: 'glyphicon-exclamation-sign',
      WARNING: 'glyphicon-warning-sign',
      INFO: 'glyphicon-info-sign',
      SUCCESS: 'glyphicon-ok'
    };
    var feedbackIcons = {
      ERROR: 'glyphicon-remove',
      WARNING: 'glyphicon-warning-sign',
      INFO: 'glyphicon-info-sign',
      SUCCESS: 'glyphicon-ok'
    };
    var alertClasses = {
      ERROR: 'alert-danger',
      WARNING: 'alert-warning',
      INFO: 'alert-info',
      SUCCESS: 'alert-success'
    };

    return {
      restrict: 'A',
      require: ['?^afFeedback', '^afSubmit', '^form'],
      templateUrl: 'templates/bootstrap/messageDirective.html',
      link: function ($scope, elem, attrs, ctrls) {
        var
          afFeedbackCtrl = ctrls[0],
          afSubmit = ctrls[1],
          formCtrl = ctrls[2],
          messageId = attrs.afMessage || attrs.afMessageId;

        MessageService.validation(formCtrl.$name + '.' + messageId, function (messages, messageType) {
          // Feedback
          if (afFeedbackCtrl && afFeedbackCtrl.messageId === attrs.afMessage) {
            $scope.messageType = messageType || (afSubmit.showSuccess ? MESSAGE_TYPES[0] : undefined);
            $scope.icon = feedbackIcons[$scope.messageType];
          }

          // Messages
          angular.forEach(messages, function (message) {
            message.alertClass = alertClasses[message.type];
            message.icon = icons[message.type];
          });
          $scope.messages = messages;
        });
      }
    };
  });
