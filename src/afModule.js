/**
 * @ngdoc overview
 * @name index
 * @description
 * # Documentation for Angular Form Messages
 *
 * There are two modules. The base module ({@link angularFormMessages}) and a Bootstrap extension ({@link angularFormMessagesBootstrap}).
 * Feel free to add both js files to your app in a script tag.
 *
 * Angular Form Messages can be used with Angular 1.2 and up.
 *
 * ## Why?
 * When you make a form in Angular, you usually add validation messages using `ng-show="formName.fieldName.$dirty && formName.fieldName.$invalid"`.
 *
 * Since Angular 1.3, showing messages has been a lot easier, but this "dirty and invalid" boilerplate is still required to have control over showing and hiding messages.
 *
 * The addition of `ngModelOptions` give you freedom to set model triggers (ie. on blur), but this still requires some boilerplate code every form element.
 * Nevertheless this functionality is not available in Angular 1.2.
 *
 * Angular Form Messages helps you with managing form messages by doing some simple configuration.
 *
 * ## How it works
 *
 * When a field becomes invalid, a validation event is emitted. Event listeners that are subscribed to the field that broadcasts this event are called.
 *
 * The result is that the {@link angularFormMessagesBootstrap.directive:afFieldState afFieldState} directive adds a `'has-error'` class,
 * the {@link angularFormmessagesBootstrap.directive:afMessages afMessages} directives shows a message, etc.
 *
 * ## Usage
 *
 * Just make a form like you are used to, with `ng-model`s on the form elements. The form tag and the form elements have `name` attributes.
 *
 * Now you have to add the AFM sauce:
 * 1. Add `af-field` to the form elements.
 * 2. Add `af-submit="submitMethod()"` to the form tag and remove `ng-submit`.
 * 3. Add `af-messages="fieldName"` directives to the places where you want to show messages for certain fields.
 * 4. Add `af-messages` directives to the form to show general form messages.
 *
 * When you also want to show server side messages, the `submitMethod` needs to return a rejecting promise containing:
 * ```
 * {
 *   validation: {
 *     formName: {
 *       $messages: [{
 *         message: 'This is general form message', type: 'ERROR'
 *       }],
 *       fieldName1: [
 *         { message: 'This is the first message for fieldName1', type: 'ERROR' },
 *         { message: 'This is the second message for fieldName1', type: 'WARNING' }
 *       ],
 *       fieldName2: [
 *         { message: 'This is the first message for fieldName2', type: 'INFO' },
 *         { message: 'This is the second message for fieldName2', type: 'SUCCESS' }
 *       ],
 *     }
 *   }
 * }
 * ```
 *
 * You can easily add your own custom directives by subscribing to the `validation` event.
 *
 * ## Modules
 *
 * ### {@link angularFormMessages}
 * This module contains the base directives to make Angular Form Messages work. Showing messages when filling in the form,
 * but also when processing messages after submitting.
 *
 * The directives are using the {@link angularFormMessages.service:AfMessageService AfMessageService} util methods.
 * You can inject this service when you are making your own directives.
 *
 * ### {@link angularFormMessagesBootstrap}
 * Additional directives and extensions of the base directives that show feedback icons on the form elements and add `'has-error'` classes to the form wraps.
 */

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
 * * {@link angularFormMessages.service:AfMessageService afMessageService} - Contains all shared utility functions that are used by the directives. The provider does app wide configuration.
 *
 */
angular.module('angularFormMessages', []);
