angular.module('angularFormMessagesBootstrap', ['angularFormMessages']);

angular.module('angularFormMessagesBootstrap')
  .directive('afFeedback', ["MESSAGE_TYPES", "AfMessageService", function (
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

        AfMessageService.validation($scope, afFeedbackCtrl.messageId, function (validationMessageId, messages) {
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
 * Where there are multiple messages and multiple messages are shown, no class is added.
 * When there is no message (the field is valid) and showSuccess is true, show the 'has-success' class.
 */
  .directive('afFieldState', ["$timeout", "AfMessageService", "MESSAGE_TYPES", function (
    $timeout,
    AfMessageService,
    MESSAGE_TYPES
  ) {
    return {
      require: '^afSubmit',
      controller: angular.noop,
      link: function ($scope, elem, attrs, afSubmitCtrl) {
        var typeToFieldStateClass = {};
        typeToFieldStateClass[MESSAGE_TYPES[0]] = 'has-success';
        typeToFieldStateClass[MESSAGE_TYPES[1]] = 'has-info';
        typeToFieldStateClass[MESSAGE_TYPES[2]] = 'has-warning';
        typeToFieldStateClass[MESSAGE_TYPES[3]] = 'has-error';

        var alertClassToType = {
          'alert-success': MESSAGE_TYPES[0],
          'alert-info': MESSAGE_TYPES[1],
          'alert-warning': MESSAGE_TYPES[2],
          'alert-danger': MESSAGE_TYPES[3]
        };

        function addClass(messageType) {
          attrs.$addClass(typeToFieldStateClass[messageType]);
        }

        function removeClass(messageType) {
          attrs.$removeClass(typeToFieldStateClass[messageType]);
        }

        function groupByMessageType(alerts) {
          var groupedAlerts = {};
          angular.forEach(alerts, function (alert) {
            // Find the alert-* class, expects one found class
            var type = alert.className.match(/(alert-\w+)/g)[0];
            groupedAlerts[type] = alert;
          });
          return groupedAlerts;
        }

        var
          cachedMessages = [],
          messageId = attrs.afFieldState || attrs.afMessageId;

        $scope.$on('validation', function (event, validationMessageId, messages) {
          // Make sure that the AfMessages validation callback runs first
          $timeout(function () {
            var alerts = elem[0].querySelectorAll('.alert');
            var alertClasses = Object.keys(groupByMessageType(alerts));

            // Remove all classes to start clean
            angular.forEach(MESSAGE_TYPES, function (type) {
              removeClass(type);
            });

            // Save messages cache (determine below if we have to show them)
            if (validationMessageId === messageId) {
              cachedMessages = messages;
            }

            // There is exactly one afMessage in the DOM
            if (alertClasses.length === 1) {
              addClass(alertClassToType[alertClasses[0]]);
            }

            // There is no afMessage in the DOM
            if (!alertClasses.length) {

              if (cachedMessages.length) {
                addClass(AfMessageService.getMostSevereMessage(cachedMessages).type);
              } else if (afSubmitCtrl.showSuccess) {
                addClass(MESSAGE_TYPES[0]);
              }
            }

          });
        });
      }
    };
  }]);

angular.module('angularFormMessagesBootstrap')
  .directive('afMessages', ["AfMessageService", "MESSAGE_TYPES", function (
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

        function groupAllMessagesById(messages, validationMessageId) {
          var newMessages = {};
          newMessages[validationMessageId] = messages;
          return angular.extend(allActiveMessages || {}, newMessages);
        }

        var
          afFeedbackCtrl = ctrls[0],
          afMessagesCtrl = ctrls[1],
          afSubmitCtrl = ctrls[2],
          allActiveMessages;

        var messageId = afMessagesCtrl.messageIdPrefix || afMessagesCtrl.messageId;
        AfMessageService.validation($scope.$parent, messageId, function (validationMessageId, messages, messageType) {
          // Feedback
          if (afFeedbackCtrl && afFeedbackCtrl.messageId === afMessagesCtrl.messageId) {
            $scope.messageType = messageType || (afSubmitCtrl.showSuccess ? MESSAGE_TYPES[0] : undefined);
            $scope.icon = feedbackIcons[$scope.messageType];
          }

          messages = addMessageInfo(messages);
          messages = groupAllMessagesById(messages, validationMessageId);
          allActiveMessages = messages;
          $scope.messages = AfMessageService.getMessagesToShow(messages);
        }, !!afMessagesCtrl.messageIdPrefix);
      }
    };
  }]);

angular.module('angularFormMessages').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/bootstrap/messages.html',
    "<span ng-if=\"messageType\" data-test=\"feedback\">\n" +
    "  <span class=\"glyphicon form-control-feedback\" ng-class=\"icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">({{messageType}})</span>\n" +
    "</span>\n" +
    "<div ng-repeat=\"messagesForMessageId in messages track by $index\">\n" +
    "  <div class=\"alert help-block\" ng-class=\"'alert-' + message.alertType\" ng-style=\"{ 'margin-bottom': $last ? undefined : '0px' }\" role=\"alert\" ng-repeat=\"message in messagesForMessageId track by $index\">\n" +
    "    <span class=\"glyphicon\" ng-class=\"message.icon\" aria-hidden=\"true\"></span>\n" +
    "    <span class=\"sr-only\">{{message.type}}:</span>\n" +
    "    <span af-message-label=\"{{message.message}}\"></span>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
