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
          afSubmitCtrl = ctrls[2],
          allActiveMessages,
          fieldName = afMessagesCtrl.fieldNamePrefix || afMessagesCtrl.fieldName;

        function addMessageInfo(messages) {
          angular.forEach(messages, function (message) {
            message.alertType = alertTypes[message.type];
            message.icon = icons[message.type];
            if (message.alertType === 'danger') {
              message.ariaRole = 'alert';
              message.ariaLive = 'assertive';
            } else if (message.alertType === 'warning') {
              message.ariaRole = 'alert';
              message.ariaLive = 'polite';
            }
          });
          return messages;
        }

        function groupAllMessagesByField(messages, validationFieldName) {
          var newMessages = {};
          newMessages[validationFieldName] = messages;
          return angular.extend(allActiveMessages || {}, newMessages);
        }

        $scope.isAlert = attrs.afAlert !== undefined;
        AfMessageService.validation($scope.$parent, fieldName, function (validationFieldName, messages) {
          // Feedback
          if (afFeedbackCtrl && afFeedbackCtrl.fieldName === fieldName) {
            var message = AfMessageService.getMostSevereMessage(messages);
            $scope.messageType = (message && message.type) || (afSubmitCtrl.showSuccess ? MESSAGE_TYPES[0] : undefined);
            $scope.icon = feedbackIcons[$scope.messageType];
          }

          messages = addMessageInfo(messages);
          messages = groupAllMessagesByField(messages, validationFieldName);
          allActiveMessages = messages;
          $scope.messages = AfMessageService.getMessagesToShow(messages);
        }, !!afMessagesCtrl.fieldNamePrefix);
      }
    };
  });
