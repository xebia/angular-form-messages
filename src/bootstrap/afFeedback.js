angular.module('angularFormMessagesBootstrap')
/**
 * @ngdoc directive
 * @name angularFormMessagesBootstrap.directive:afFeedback
 * @description
 * Adds the 'has-feedback' class to the element when a feedback icon is shown in the {@link angularFormMessagesBootstrap.directive:afMessages} component.
 */
  .directive('afFeedback', function (
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
  });
