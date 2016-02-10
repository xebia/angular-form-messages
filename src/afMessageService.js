angular.module('angularFormMessages')
  .constant('MESSAGE_TYPES', ['SUCCESS', 'INFO', 'WARNING', 'ERROR'])
  .constant('SHOW_MULTIPLE', { ALL: true, ONE: false, ONE_PER_MESSAGE_ID: 'ONE_PER_MESSAGE_ID' })
  .provider('AfMessageService', function (
    MESSAGE_TYPES,
    SHOW_MULTIPLE
  ) {
    var
      fieldLabelPrefix,
      genericLabelPrefix,
      scrollToError = true,
      showMultiple = SHOW_MULTIPLE.ALL,
      showSuccess = false,
      triggerOn = 'change';

    this.setFieldLabelPrefix = function (newValue) {
      fieldLabelPrefix = newValue;
    };

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
          var
            severityIndex = -1,
            result = {};

          if (showMultiple === SHOW_MULTIPLE.ALL) {
            return messages;
          }

          angular.forEach(messages, function (messagesForField, fieldName) {

            if (messagesForField.length) {
              var mostSevereMessage = messageService.getMostSevereMessage(messagesForField);
              var index = MESSAGE_TYPES.indexOf(mostSevereMessage.type);
              if (showMultiple === SHOW_MULTIPLE.ONE_PER_MESSAGE_ID) {
                result[fieldName] = [mostSevereMessage];
              } else if ((showMultiple === SHOW_MULTIPLE.ONE) && index > severityIndex) {
                severityIndex = index;
                result = {};
                result[fieldName] = [mostSevereMessage];
              }
            }
          });

          return result;
        },

        validation: function ($scope, fieldName, callback, isFieldNamePrefix) {
          $scope.$on('validation', function (event, validationFieldName, messages) {
            if (validationFieldName === fieldName || (isFieldNamePrefix && validationFieldName.indexOf(fieldName) === 0)) {
              callback(validationFieldName, messages);
            }
          });
        },

        getGenericLabelPrefix: function () {
          return genericLabelPrefix ? genericLabelPrefix + '.' : '';
        },

        getFieldLabelPrefix: function () {
          return fieldLabelPrefix ? fieldLabelPrefix + '.' : '';
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
