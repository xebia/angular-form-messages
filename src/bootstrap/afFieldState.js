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
          cachedMessages,
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

            // There is no afMessage in the DOM and this field received a validation event before
            if (!alertClasses.length && cachedMessages) {
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
  });
