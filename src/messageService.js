angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .provider('MessageService', function (
    MESSAGE_TYPES
  ) {
    var
      genericLabelPrefix,
      scrollToError = true,
      showSuccess = false,
      triggerOn = 'change';

    this.setGenericLabelPrefix = function (newValue) {
      genericLabelPrefix = newValue;
    };

    this.setScrollToError = function (newValue) {
      scrollToError = newValue;
    };

    this.setShowSuccess = function (newValue) {
      showSuccess = newValue;
    };

    this.setTriggerOn = function (newValue) {
      triggerOn = newValue;
    };

    this.$get = function ($injector) {

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
          $injector.get('$rootScope').$on('validation', function (event, validationMessageId, messages, messageType) {
            if (validationMessageId === messageId) {
              callback(messages, messageType);
            }
          });
        },

        getGenericLabelPrefix: function () {
          return genericLabelPrefix ? genericLabelPrefix + '.' : '';
        },

        scrollToError: function () {
          return scrollToError;
        },

        showSuccess: function () {
          return showSuccess;
        },

        triggerOn: function () {
          return triggerOn;
        }
      };
    };
  });
