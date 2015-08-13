angular.module('angularFormMessagesBootstrap')
  .directive('afMessage', function (
    $interpolate,
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
    var alertClasses = {
      ERROR: 'alert-danger',
      WARNING: 'alert-warning',
      INFO: 'alert-info',
      SUCCESS: 'alert-success'
    };

    return {
      restrict: 'A',
      scope: true,
      priority: 1, // Link function needs to run after non-Bootstrap afMessage
      require: ['?^afFeedback', 'afMessage', '^afSubmit', '^form'],
      templateUrl: 'templates/bootstrap/messageDirective.html',
      link: function ($scope, elem, attrs, ctrls) {
        var
          afFeedbackCtrl = ctrls[0],
          afMessageCtrl = ctrls[1],
          afSubmitCtrl = ctrls[2];

        var messageId = afMessageCtrl.messageIdPrefix || afMessageCtrl.messageId;
        AfMessageService.validation($interpolate(ctrls[3].$name)($scope) + '.' + messageId, function (messages, messageType) {
          // Feedback
          if (afFeedbackCtrl && afFeedbackCtrl.messageId === afMessageCtrl.messageId) {
            $scope.messageType = messageType || (afSubmitCtrl.showSuccess ? MESSAGE_TYPES[0] : undefined);
            $scope.icon = feedbackIcons[$scope.messageType];
          }

          // Messages
          if (!AfMessageService.showMultiple() && messages.length) {
            messages = [AfMessageService.getMostSevereMessage(messages)];
          }

          angular.forEach(messages, function (message) {
            message.alertClass = alertClasses[message.type];
            message.icon = icons[message.type];
          });
          $scope.messages = messages;
        }, !!afMessageCtrl.messageIdPrefix);
      }
    };
  });
