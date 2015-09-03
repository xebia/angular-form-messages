angular.module('angularFormMessages').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/bootstrap/messages.html',
    "<span ng-if=\"messageType\" data-test=\"feedback\">\n" +
    "  <span class=\"glyphicon form-control-feedback\" ng-class=\"icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">({{messageType}})</span>\n" +
    "</span>\n" +
    "<div ng-repeat=\"messagesForField in messages track by $index\">\n" +
    "  <div\n" +
    "      ng-class=\"isAlert ? 'alert alert-' + message.alertType : 'help-block'\"\n" +
    "      ng-style=\"{ 'margin-bottom': $last ? undefined : '0px' }\"\n" +
    "      role=\"alert\"\n" +
    "      ng-repeat=\"message in messagesForField track by $index\">\n" +
    "    <span class=\"glyphicon\" ng-class=\"message.icon\" aria-hidden=\"true\"></span>\n" +
    "    <span class=\"sr-only\">{{message.type}}:</span>\n" +
    "    <span af-message-label=\"{{message.message}}\"></span>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
