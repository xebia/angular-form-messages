angular.module('angularFormMessagesBootstrap')
/**
 * This directive shows the 'has-error', 'has-warning', 'has-info' or 'has-success' when there is one message on the field.
 * Where there are multiple messages and multiple messages are shown, no class is added.
 * When there is no message (the field is valid) and showSuccess is true, show the 'has-success' class.
 */
  .directive('afFieldState', function (
    $timeout,
    AfMessageService,
    MESSAGE_TYPES
  ) {
    return {
      require: '^afSubmit',
      controller: angular.noop,
      link: function ($scope, elem, attrs, afSubmitCtrl) {
        function typeToFieldStateClass(messageType) {
          var mapping = {};
          mapping[MESSAGE_TYPES[0]] = 'has-success';
          mapping[MESSAGE_TYPES[1]] = 'has-info';
          mapping[MESSAGE_TYPES[2]] = 'has-warning';
          mapping[MESSAGE_TYPES[3]] = 'has-error';
          return mapping[messageType]
        }

        function alertClassToType(alertClass) {
          return {
            'alert-success': MESSAGE_TYPES[0],
            'alert-info': MESSAGE_TYPES[1],
            'alert-warning': MESSAGE_TYPES[2],
            'alert-danger': MESSAGE_TYPES[3]
          }[alertClass];
        }

        function addClass(messageType) {
          attrs.$addClass(typeToFieldStateClass(messageType));
        }

        function removeClass(messageType) {
          attrs.$removeClass(typeToFieldStateClass(messageType));
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

        var messageId = attrs.afFieldState || attrs.afMessageId;
        var hasValidClass;

        $scope.$on('validation', function (event, validationMessageId, messages) {
          // Make sure that the AfMessages validation callback runs first
          $timeout(function () {
            var alerts = elem[0].querySelectorAll('.alert');
            var alertClasses = Object.keys(groupByMessageType(alerts));

            // Remove all classes to start clean
            angular.forEach(MESSAGE_TYPES, function (type) {
              removeClass(type);
            });

            // There is exactly one afMessage in the DOM
            if (alertClasses.length === 1) {
              addClass(alertClassToType(alertClasses[0]));
            }

            // There is no afMessage but the field with the same messageId has one or more messages
            if (!alertClasses.length) {
              if (validationMessageId === messageId) {
                if (messages.length) {
                  addClass(AfMessageService.getMostSevereMessage(messages).type);
                }
                // There are no afMessages or messages for the current messageId
                // Determine if there should be a 'success' class for the field with the same message id
                else if (afSubmitCtrl.showSuccess) {
                  hasValidClass = true;
                  addClass(MESSAGE_TYPES[0]);
                }
              }
              // Show the 'success' class when there are no afMessages and the event is not for this fieldstate
              else if (hasValidClass) {
                addClass(MESSAGE_TYPES[0]);
              }
            }

          });
        });
      }
    };
  });
