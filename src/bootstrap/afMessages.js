angular.module('angularFormMessagesBootstrap')
/**
 * @ngdoc directive
 * @name angularFormMessagesBootstrap.directive:afMessages
 * @description
 * Component that shows a message in a Bootstrap alert.
 */
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
        function addMessageInfo(messages) {
          angular.forEach(messages, function (message) {
            message.alertType = alertTypes[message.type];
            message.icon = icons[message.type];
          });
          return messages;
        }

        function groupAllMessagesByField(messages, validationFieldName) {
          var newMessages = {};
          newMessages[validationFieldName] = messages;
          return angular.extend(allActiveMessages || {}, newMessages);
        }

        var
          afFeedbackCtrl = ctrls[0],
          afMessagesCtrl = ctrls[1],
          afSubmitCtrl = ctrls[2],
          allActiveMessages;

        var fieldName = afMessagesCtrl.fieldNamePrefix || afMessagesCtrl.fieldName;
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
