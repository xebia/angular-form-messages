# Angular Form Messages

[![Build Status](https://travis-ci.org/xebia/angular-form-messages.svg?branch=master)](https://travis-ci.org/xebia/angular-form-messages)
[![Test Coverage](https://codeclimate.com/github/xebia/angular-form-messages/badges/coverage.svg)](https://codeclimate.com/github/xebia/angular-form-messages)
[![Code Climate](https://codeclimate.com/github/xebia/angular-form-messages/badges/gpa.svg)](https://codeclimate.com/github/xebia/angular-form-messages)

Angular Form Messages lets you show custom validation messages on your forms. There are several Github projects that provide form validation directives,
but most of them do not allow you to set custom validation callbacks on your forms or they do not support validation messages that come from your backend.
Angular Form Messages also gives you the ability to show validation messages for groups of fields.

Check out the [documentation](http://xebia.github.io/angular-form-messages) pages (under development).

Here is an example project: [Angular Form Messages Example](http://github.com/xebia/angular-form-messages-example)

## Installation

Add the Angular Form Messages dependency to your project.

`bower install --save-dev angular-form-messages`

Include dist/angular-form-messages.js (min.js) and optionally dist/angular-form-messages-bootstrap.js in a script tag.

The bootstrap scripts contain some additional helper directives for adding Bootstrap HTML and CSS classes
(see [documentation](http://xebia.github.io/angular-form-messages/#/api/angularFormMessagesBootstrap)).

## Build & development

Running `grunt` tests and builds the project.
