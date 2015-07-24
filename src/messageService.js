angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .factory('MessageService', function (
    $rootScope,
    MESSAGE_TYPES
  ) {
    return {
      /**
       * Determine the message type with the highest severity from a list of messages
       * @param {Object[]} messages
       * @returns {string} message type with the highest severity
       */
      determineMessageType: function (messages) {
        var severityIndex = -1;
        angular.forEach(messages, function (message) {
          var index = MESSAGE_TYPES.indexOf(message.type);
          if (index > severityIndex) {
            severityIndex = index;
          }
        });
        return severityIndex === -1 ? undefined : MESSAGE_TYPES[severityIndex];
      },

      validation: function (messageId, callback) {

        $rootScope.$on('validation', function (event, validationMessageId, messages, messageType) {
          if (validationMessageId === messageId) {
            callback(messages, messageType);
          }
        });
      }
    };
  });
