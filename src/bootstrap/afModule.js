/**
 * @ngdoc overview
 * @name angularFormMessagesBootstrap
 * @description
 * Extension on the Angular Form Messages module to add Twitter Bootstrap behaviour to the forms.
 *
 * ## Directives
 * * {@link angularFormMessagesBootstrap.directive:afFeedback afFeedback} - Adds the 'has-feedback' class for correct feedback icon position.
 * * {@link angularFormMessagesBootstrap.directive:afFieldState afFieldState} - Adds the 'has-error', 'has-warning', 'has-info' or 'has-success' class when there are messages in child elements or associated afFields.
 * If the {@link angularFormMessagesBootstrap.directive:afFeedback afFeedback} directive is also set on the element, the 'has-feedback' class is also added when appropriate.
 * * {@link angularFormMessagesBootstrap.directive:afMessages afMessages} - Showing an alert box with message(s). Also shows a feedback icon (checkmark, warning sign or cross) if the {@link angularFormMessagesBootstrap.directive:afFeedback afFeedback} directive is used on a parent element.
 */
angular.module('angularFormMessagesBootstrap', ['angularFormMessages']);
