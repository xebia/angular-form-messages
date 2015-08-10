angular.module('angularFormMessagesBootstrap', ['angularFormMessages']);

angular.module('angularFormMessagesBootstrap')
  .directive('afFeedback', ["MESSAGE_TYPES", "AfMessageService", function (
    MESSAGE_TYPES,
    AfMessageService
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

        AfMessageService.validation(formCtrl.$name + '.' + afFeedbackCtrl.messageId, function (messages) {
          if (messages.length || afSubmitCtrl.showSuccess) {
            attrs.$addClass('has-feedback');
          } else {
            attrs.$removeClass('has-feedback');
          }
        });
      }
    };
  }]);

angular.module('angularFormMessagesBootstrap')
/**
 * This directive shows the 'has-error', 'has-warning', 'has-info' or 'has-success' when there is one message on the field.
 * Where there are multiple messages, no class is added.
 * When there is no message (the field is valid) and showSuccess is true, show the 'has-success' class.
 */
  .directive('afFieldState', ["MESSAGE_TYPES", "AfMessageService", function (
    MESSAGE_TYPES,
    AfMessageService
  ) {
    return {
      require: ['^afSubmit', '^form'],
      link: function ($scope, elem, attrs, ctrls) {
        var
          afSubmitCtrl = ctrls[0],
          formCtrl = ctrls[1],
          messageId = attrs.afFieldState || attrs.afMessageId;

        AfMessageService.validation(formCtrl.$name + '.' + messageId, function (messages, messageType) {
          angular.forEach(MESSAGE_TYPES, function (type) {
            attrs.$removeClass('has-' + type.toLowerCase());
          });

          if (messageType && messages.length === 1) {
            attrs.$addClass('has-' + messageType.toLowerCase());
          } else if (afSubmitCtrl.showSuccess && !messages.length) {
            attrs.$addClass('has-success');
          }
        });
      }
    };
  }]);

angular.module('angularFormMessagesBootstrap')
  .directive('afMessage', ["MESSAGE_TYPES", "AfMessageService", function (
    MESSAGE_TYPES,
    AfMessageService
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

        AfMessageService.validation(formCtrl.$name + '.' + messageId, function (messages, messageType) {
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
  }]);

angular.module('angularFormMessages').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/bootstrap/messageDirective.html',
    "<span ng-if=\"messageType\" data-test=\"feedback\">\n" +
    "  <span class=\"glyphicon form-control-feedback\" ng-class=\"icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">({{messageType}})</span>\n" +
    "</span>\n" +
    "<div class=\"alert help-block\" ng-class=\"message.alertClass\" ng-style=\"{ 'margin-bottom': $last ? undefined : '0px' }\" role=\"alert\" ng-repeat=\"message in messages track by $index\">\n" +
    "  <span class=\"glyphicon\" ng-class=\"message.icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">{{message.type}}:</span>\n" +
    "  <span af-message-label=\"{{message.message}}\"></span>\n" +
    "</div>\n"
  );

}]);
