// A simple Meteor internationalization
//
// @author Tarcísio Gruppi <txgruppi@gmail.com>
// @version 0.2.3
// @date 2013-03-27

(function(){
  // Register a Handlebars helper named `t`
  // Try to translate a string using `I18n.prototype.t`
  //
  // Use `_.str.sprintf` to return a formated string
  //
  // Usage:
  // <pre>&lt;template name="greeting"&gt;
  //   {{t "Hi, %s", userName}}
  // &lt;/template&gt;</pre>
  //
  // @see `I18n.prototype.t`
  Handlebars.registerHelper('t', function(object){
    var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    args[0] = Meteor.I18n().t(args[0]);
    if (args.length > 1) {
      return _.str.sprintf.apply(_.str, args);
    } else {
      return args[0];
    }
  });
})();
