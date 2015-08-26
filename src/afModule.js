/**
 * @ngdoc overview
 * @name angularFormMessages
 * @description
 * The Angular Form Messages module. Contains all basic functionality to make Angular Form Messages possible.
 *
 * ## Directives
 * * {@link angularFormMessages.directive:afField afField} - Registering a form element.
 * * {@link angularFormMessages.directive:afMessageLabel afMessageLabel} - Showing a translated message.
 * * {@link angularFormMessages.directive:afMessages afMessages} - Showing messages.
 * * {@link angularFormMessages.directive:afSubmit afSubmit} - Handles the form submit.
 * * {@link angularFormMessages.directive:afSubmitButton afSubmitButton} - Disables the form submit button and sets a flag on the scope while submitting.
 *
 * ## Services
 * * {@link angularFormMessages.directive:afMessageService afMessageService} - Contains all shared utility functions that are used by the directives. The provider does app wide configuration.
 *
 */
angular.module('angularFormMessages', []);
