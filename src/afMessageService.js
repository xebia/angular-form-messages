angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .constant('SHOW_MULTIPLE', { ALL: true, ONE: false, ONE_PER_MESSAGE_ID: 'ONE_PER_MESSAGE_ID' })
  .provider('AfMessageService', function (
    MESSAGE_TYPES,
    SHOW_MULTIPLE
  ) {
    var
      genericLabelPrefix,
      scrollToError = true,
      showMultiple = SHOW_MULTIPLE.ALL,
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

    this.$get = function (SHOW_MULTIPLE) {

      var messageService = {
        /**
         * Determine the message with the highest severity from a list of messages
         * @param {Object[]} messages
         * @returns {Object} message with the highest severity
         */
        getMostSevereMessage: function (messages) {
          var severityIndex = -1, mostSevereMessage;
          angular.forEach(messages, function (message) {
            var index = MESSAGE_TYPES.indexOf(message.type);
            if (index > severityIndex) {
              severityIndex = index;
              mostSevereMessage = message;
            }
          });
          return mostSevereMessage;
        },
        getMessagesToShow: function (messages) {
          var result = {}, severityIndex = -1;

          if (showMultiple === SHOW_MULTIPLE.ALL) {
            return messages;
          }

          angular.forEach(messages, function (messagesForMessageId, messageId) {

            if (messagesForMessageId.length) {
              var mostSevereMessage = messageService.getMostSevereMessage(messagesForMessageId);
              var index = MESSAGE_TYPES.indexOf(mostSevereMessage.type);
              if (showMultiple === SHOW_MULTIPLE.ONE_PER_MESSAGE_ID) {
                result[messageId] = [mostSevereMessage];
              } else if ((showMultiple === SHOW_MULTIPLE.ONE) && index > severityIndex) {
                severityIndex = index;
                result = {};
                result[messageId] = [mostSevereMessage];
              }
            }
          });

          return result;
        },

        validation: function ($scope, messageId, callback, isMessageIdPrefix) {
          $scope.$on('validation', function (event, validationMessageId, messages, messageType) {
            if (validationMessageId === messageId || (isMessageIdPrefix && validationMessageId.indexOf(messageId) === 0)) {
              callback(validationMessageId, messages, messageType);
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

      return messageService;
    };
  });
