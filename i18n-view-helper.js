// A simple Meteor internationalization
//
// @author Tarcísio Gruppi <txgruppi@gmail.com>

(function(){
  // Register a Handlebars helper named `t`
  // Try to translate a string using `I18n.prototype.t`
  //
  // Use `Meteor.I18n().sprintf` to return a formated string
  //
  // Usage:
  // <pre>&lt;template name="greeting"&gt;
  //   {{t "Hi, %s", userName}}
  // &lt;/template&gt;</pre>
  //
  // @see `I18n.prototype.t`
  UI.registerHelper('t', function(object){
    var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    args[0] = Meteor.I18n().t(args[0]);
    if (args.length > 1) {
      return Meteor.I18n().sprintf.apply(Meteor.I18n().sprintf, args);
    } else {
      return args[0];
    }
  });
})();
