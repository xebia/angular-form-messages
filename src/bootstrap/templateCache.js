angular.module('angularFormMessages').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/bootstrap/messageDirective.html',
    "<span ng-if=\"messageType\" data-test=\"feedback\">\n" +
    "  <span class=\"glyphicon form-control-feedback\" ng-class=\"icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">({{messageType}})</span>\n" +
    "</span>\n" +
    "<div class=\"alert help-block\" ng-class=\"message.alertClass\" ng-style=\"{ 'margin-bottom': $last ? undefined : '0px' }\" role=\"alert\" ng-repeat=\"message in messages track by $index\">\n" +
    "  <span class=\"glyphicon\" ng-class=\"message.icon\" aria-hidden=\"true\"></span>\n" +
    "  <span class=\"sr-only\">{{message.type}}:</span>\n" +
    "  {{message.message | translate}}\n" +
    "</div>\n"
  );

}]);
