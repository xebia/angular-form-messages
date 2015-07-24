angular.module('angularFormMessagesBootstrap')
  .directive('afMessage', function (
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
      templateUrl: 'templates/messageDirective.html',
      link: function ($scope, elem, attrs) {

        $scope.$on('validation', function onValidation(event, messageId, messages, messageType) {
          if (messageId === attrs.afMessage) {
            // Feedback
            $scope.messageType = messageType || MESSAGE_TYPES[0];
            $scope.icon = feedbackIcons[$scope.messageType];

            // Messages
            angular.forEach(messages, function (message) {
              message.alertClass = alertClasses[message.type];
              message.icon = icons[message.type];
            });
            $scope.messages = messages;
          }
        });
      }
    };
  });
