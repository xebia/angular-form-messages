angular.module('angularFormMessagesBootstrap')
  .directive('afMessages', function (
    AfMessageService,
    MESSAGE_TYPES
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
    var alertTypes = {
      ERROR: 'danger',
      WARNING: 'warning',
      INFO: 'info',
      SUCCESS: 'success'
    };

    return {
      restrict: 'A',
      scope: true,
      priority: 1, // Link function needs to run after non-Bootstrap afMessage
      require: ['?^afFeedback', 'afMessages', '^afSubmit'],
      templateUrl: 'templates/bootstrap/messages.html',
      link: function ($scope, elem, attrs, ctrls) {
        var
          afFeedbackCtrl = ctrls[0],
          afMessagesCtrl = ctrls[1],
          afSubmitCtrl = ctrls[2];

        var messageId = afMessagesCtrl.messageIdPrefix || afMessagesCtrl.messageId;
        AfMessageService.validation($scope.$parent, messageId, function (validationMessageId, messages, messageType) {
          // Feedback
          if (afFeedbackCtrl && afFeedbackCtrl.messageId === afMessagesCtrl.messageId) {
            $scope.messageType = messageType || (afSubmitCtrl.showSuccess ? MESSAGE_TYPES[0] : undefined);
            $scope.icon = feedbackIcons[$scope.messageType];
          }

          // Messages
          if (!AfMessageService.showMultiple() && messages.length) {
            messages = [AfMessageService.getMostSevereMessage(messages)];
          }

          angular.forEach(messages, function (message) {
            message.alertType = alertTypes[message.type];
            message.icon = icons[message.type];
          });
          $scope.messages = messages;
        }, !!afMessagesCtrl.messageIdPrefix);
      }
    };
  });
