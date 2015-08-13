angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .provider('AfMessageService', function (
    MESSAGE_TYPES
  ) {
    var
      genericLabelPrefix,
      scrollToError = true,
      showMultiple = true,
      showSuccess = false,
      triggerOn = 'change';

    this.setGenericLabelPrefix = function (newValue) {
      genericLabelPrefix = newValue;
    };

    this.setScrollToError = function (newValue) {
      scrollToError = newValue;
    };

    this.setShowMultiple = function (newValue) {
      showMultiple = newValue;
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
         * Determine the message with the highest severity from a list of messages
         * @param {Object[]} messages
         * @returns {Object} message with the highest severity
         */
        getMostSevereMessage: function (messages) {
          var severityIndex = -1;
          var mostSevereMessage;
          angular.forEach(messages, function (message) {
            var index = MESSAGE_TYPES.indexOf(message.type);
            if (index > severityIndex) {
              severityIndex = index;
              mostSevereMessage = message;
            }
          });
          return mostSevereMessage;
        },

        validation: function ($scope, messageId, callback, isMessageIdPrefix) {
          $scope.$on('validation', function (event, validationMessageId, messages, messageType) {
            if (validationMessageId === messageId || (isMessageIdPrefix && validationMessageId.indexOf(messageId) === 0)) {
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

        showMultiple: function () {
          return showMultiple;
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
