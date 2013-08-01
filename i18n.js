// A simple Meteor internationalization
//
// @author Tarcísio Gruppi <txgruppi@gmail.com>
// @version 0.2.3
// @date 2013-03-27

(function(){
  // The I18n class constructor
  function I18n(options) {
    this.init(options);
  };

  // Initialize the I18n instance
  //
  // @param object options
  //
  // Options:
  //   `string defaultLang` The default language to use.
  //   `boolean allowClientOperations` Allow clients to insert, update or remove.
  //   `string collectionName` The name of the collection used to store the strings.
  //
  // @return I18n `this`
  I18n.prototype.init = function(options) {
    var self = this;
    this.defaultLang = options && options.defaultLang || 'en';
    this.allowClientOperations = options && options.allowClientOperations || false;
    this.collectionName = options && options.collectionName || 'i18n';

    // Create the collection
    this.collection = new Meteor.Collection(this.collectionName);

    // Publish the selected language
    // {is_auto: true} to prevent autopublish warning
    if (Meteor.isServer) {
      Meteor.publish('current_language_records', function(lang){
        check(lang, String);
        if (lang) {
          return self.collection.find({lang:lang});
        }
      }, {is_auto: true});

      // Block client operations if `this.allowClientOperations === false`
      var retFunc = function() {return self.allowClientOperations;};
      this.collection.allow({
        insert: retFunc,
        update: retFunc,
        remove: retFunc
      });
    }

    // Subscribe to the selected language
    if (Meteor.isClient) {
      Meteor.autosubscribe(function(){
        Meteor.subscribe("current_language_records", Session.get("current_language"));
      });

      // Set the current langauge to the default language
      Session.set("current_language", this.defaultLang);
    }

    return this;
  };

  // Insert a string to be translated
  //
  // This method have 3 signatures
  //
  // @param string lang The target language
  // @param string baseStr The base string
  // @param string newStr The translated string
  //
  // @param string lang The target language
  // @param array baseStr An array where each element is a array `[baseStr, newStr]`
  //
  // @param string lang The target language
  // @param object baseStr An object with `baseStr` as key and `newStr` as value
  //
  // @throws
  //
  // @return I18n `this`
  I18n.prototype.insert = function(lang, baseStr, newStr) {
    if (typeof baseStr === 'string') {
      this.collection.insert({lang:lang, base_str:baseStr, new_str:newStr});
    } else if (_.isArray(baseStr)) {
      baseStr.forEach(function(i){
        Meteor.I18n().insert(lang, i[0], i[1]);
      });
    } else if (typeof baseStr == 'object') {
      for (var i in baseStr) {
        Meteor.I18n().insert(lang, i, baseStr[i]);
      }
    } else
      throw 'Expected string|object|array. Got: ' + (typeof str);

    return this;
  };

  // Remove a string or an entire language
  //
  // This method have 2 signatures
  //
  // @param string lang The target language
  // @param string baseStr The base string
  //
  // @param string lang The target language
  // @param array baseStr An array where each element is a string `baseStr`
  //
  // @throws
  //
  // @return I18n `this`
  I18n.prototype.remove = function(lang, baseStr) {
    if (!baseStr) {
      this.collection.remove({lang:lang});

      return this;
    }

    if (typeof baseStr === 'string') {
      this.collection.remove({lang:lang, base_str:baseStr});
    } else if (_.isArray(baseStr)) {
      baseStr.forEach(function(i){
        Meteor.I18n().remove(lang, i);
      });
    } else
      throw 'Expected string|array. Got: ' + (typeof str);

    return this;
  };

  // Get or set the current language
  // Use a Session var to store the current language and redraw all templates when changed
  //
  // Set:
  // @param string lang The target language
  //
  // @return I18n `this`
  //
  // Get:
  // @param void
  //
  // @return string The current language
  I18n.prototype.lang = function() {
    if (arguments.length == 0)
      return Session.get("current_language");
    else
      Session.set("current_language", arguments[0]);

    return this;
  };

  // Translate a string
  // Translate the string based on the current language
  //
  // @param string str The `baseStr`
  //
  // @return string The `newStr` if found or the `baseStr` if not
  I18n.prototype.t = function(str) {
    var row = this.collection.findOne({lang:Session.get("current_language"), base_str: str});
    if (row && row.new_str)
      return row.new_str;

    return str;
  };

  var instance = null;

  // Singleton
  //
  // @see `I18n.prototype.init`
  Meteor.I18n = function(options) {
    if (!instance)
      instance = new I18n(options);
    return instance;
  };
})();
