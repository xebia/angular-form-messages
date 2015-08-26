/**
 * @ngdoc directive
 * @name angularFormMessages.directive:afMessages
 * @description
 * Registers a fieldName so that it can show messages.
 * This directive is supposed to be extended (see {@link angularFormMessagesBootstrap.directive:afMessages afMessages}) to show messages.
 *
 * @scope true
 */
angular.module('angularFormMessages')
  .directive('afMessages', function () {
    return {
      scope: true,
      require: 'afMessages',
      controller: angular.noop,
      link: function linkFn($scope, elem, attrs, afMessagesCtrl) {
        afMessagesCtrl.fieldNamePrefix = attrs.afFieldNamePrefix;
        afMessagesCtrl.fieldName = attrs.afMessages || attrs.afFieldName || '';
      }
    };
  });
