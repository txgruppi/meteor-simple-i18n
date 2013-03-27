// A simple Meteor internationalization
//
// @author Tarcísio Gruppi <txgruppi@gmail.com>
// @version 0.1.7
// @date 2013-03-27

// Package description
Package.describe({
  summary: "A simple Meteor internationalization"
});

// On use
Package.on_use(function (api) {
  // Add deps
  api.use('underscore-string', ["client"]);

  // Add files
  api.add_files("i18n.js", ["client", "server"]);
  api.add_files("i18n-view-helper.js", "client");
});
