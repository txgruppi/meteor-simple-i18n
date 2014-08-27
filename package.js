// A simple Meteor internationalization
//
// @author Tarcísio Gruppi <txgruppi@gmail.com>
// @version 0.4.0
// @date 2013-03-27

// Package description
Package.describe({
  summary: "A simple Meteor internationalization",
  version: "0.4.0",
  git: "https://github.com/txgruppi/meteor-simple-i18n.git"
});

// On use
Package.on_use(function (api) {
  api.versionsFrom("METEOR@0.9.0");

  // Add files
  api.add_files("i18n.js", ["client", "server"]);
  api.add_files("i18n-view-helper.js", "client");
});
