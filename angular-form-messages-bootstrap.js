/**
 * @ngdoc overview
 * @name angularFormMessagesBootstrap
 * @description
 * Extension on the Angular Form Messages module to add Twitter Bootstrap behaviour to the forms.
 *
 * ## Directives
 * * {@link angularFormMessagesBootstrap.directive:afFeedback afFeedback} - Adds the 'has-feedback' class for correct feedback icon position.
 * * {@link angularFormMessagesBootstrap.directive:afFieldState afFieldState} - Adds the 'has-error', 'has-warning', 'has-info' or 'has-success' class when there are messages in child elements or associated afFields.
 * If the {@link angularFormMessagesBootstrap.directive:afFeedback afFeedback} directive is also set on the element, the 'has-feedback' class is also added when appropriate.
 * * {@link angularFormMessagesBootstrap.directive:afMessages afMessages} - Showing an alert box with message(s). Also shows a feedback icon (checkmark, warning sign or cross) if the {@link angularFormMessagesBootstrap.directive:afFeedback afFeedback} directive is used on a parent element.
 */
angular.module('angularFormMessagesBootstrap', ['angularFormMessages']);

angular.module('angularFormMessagesBootstrap')
/**
 * @ngdoc directive
 * @name angularFormMessagesBootstrap.directive:afFeedback
 * @description
 * Adds the 'has-feedback' class to the element when a feedback icon is shown in the {@link angularFormMessagesBootstrap.directive:afMessages} component.
 */
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

        afFeedbackCtrl.fieldName = attrs.afFeedback || attrs.afFieldName;

        AfMessageService.validation($scope, afFeedbackCtrl.fieldName, function (validationFieldName, messages) {
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
 * @ngdoc directive
 * @name angularFormMessagesBootstrap.directive:afFieldState
 * @description
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
          fieldName = attrs.afFieldState || attrs.afFieldName;

        $scope.$on('validation', function (event, validationFieldName, messages) {
          // Make sure that the AfMessages validation callback runs first
          $timeout(function () {
            var alerts = elem[0].querySelectorAll('.alert');
            var alertClasses = Object.keys(groupByMessageType(alerts));

            // Remove all classes to start clean
            angular.forEach(MESSAGE_TYPES, function (type) {
              removeClass(type);
            });

            // Save messages cache (determine below if we have to show them)
            if (validationFieldName === fieldName) {
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
/**
 * @ngdoc directive
 * @name angularFormMessagesBootstrap.directive:afMessages
 * @description
 * Component that shows a message in a Bootstrap alert.
 */
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
  }]);

angular.module('angularFormMessages').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/bootstrap/messages.html',
    "<span ng-if=\"messageType\" data-test=\"feedback\">\n" +
    "  <span class=\"glyphicon form-control-feedback\" ng-class=\"icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">({{messageType}})</span>\n" +
    "</span>\n" +
    "<div ng-repeat=\"messagesForField in messages track by $index\">\n" +
    "  <div class=\"alert help-block\" ng-class=\"'alert-' + message.alertType\" ng-style=\"{ 'margin-bottom': $last ? undefined : '0px' }\" role=\"alert\" ng-repeat=\"message in messagesForField track by $index\">\n" +
    "    <span class=\"glyphicon\" ng-class=\"message.icon\" aria-hidden=\"true\"></span>\n" +
    "    <span class=\"sr-only\">{{message.type}}:</span>\n" +
    "    <span af-message-label=\"{{message.message}}\"></span>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
