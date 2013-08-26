// A simple Meteor internationalization
//
// @author Tarcísio Gruppi <txgruppi@gmail.com>
// @version 0.3.1
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

  /*! sprintf.js | Copyright (c) 2007-2013 Alexandru Marasteanu <hello at alexei dot ro> | 3 clause BSD license */

  (function(ctx) {
    var sprintf = function() {
      if (!sprintf.cache.hasOwnProperty(arguments[0])) {
        sprintf.cache[arguments[0]] = sprintf.parse(arguments[0]);
      }
      return sprintf.format.call(null, sprintf.cache[arguments[0]], arguments);
    };

    sprintf.format = function(parse_tree, argv) {
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i]);
        if (node_type === 'string') {
          output.push(parse_tree[i]);
        }
        else if (node_type === 'array') {
          match = parse_tree[i]; // convenience purposes only
          if (match[2]) { // keyword argument
            arg = argv[cursor];
            for (k = 0; k < match[2].length; k++) {
              if (!arg.hasOwnProperty(match[2][k])) {
                throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
              }
              arg = arg[match[2][k]];
            }
          }
          else if (match[1]) { // positional argument (explicit)
            arg = argv[match[1]];
          }
          else { // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
          }
          switch (match[8]) {
            case 'b': arg = arg.toString(2); break;
            case 'c': arg = String.fromCharCode(arg); break;
            case 'd': arg = parseInt(arg, 10); break;
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
            case 'o': arg = arg.toString(8); break;
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
            case 'u': arg = arg >>> 0; break;
            case 'x': arg = arg.toString(16); break;
            case 'X': arg = arg.toString(16).toUpperCase(); break;
          }
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
          pad_length = match[6] - String(arg).length;
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';
          output.push(match[5] ? arg + pad : pad + arg);
        }
      }
      return output.join('');
    };

    sprintf.cache = {};

    sprintf.parse = function(fmt) {
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
      while (_fmt) {
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        }
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
          parse_tree.push('%');
        }
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [], replacement_field = match[2], field_match = [];
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else {
                  throw('[sprintf] huh?');
                }
              }
            }
            else {
              throw('[sprintf] huh?');
            }
            match[2] = field_list;
          }
          else {
            arg_names |= 2;
          }
          if (arg_names === 3) {
            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
          }
          parse_tree.push(match);
        }
        else {
          throw('[sprintf] huh?');
        }
        _fmt = _fmt.substring(match[0].length);
      }
      return parse_tree;
    };

    var vsprintf = function(fmt, argv, _argv) {
      _argv = argv.slice(0);
      _argv.splice(0, 0, fmt);
      return sprintf.apply(null, _argv);
    };

    /**
     * helpers
     */
    function get_type(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    function str_repeat(input, multiplier) {
      for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
      return output.join('');
    }

    /**
     * export to either browser or node.js
     */
    ctx.sprintf = sprintf;
    ctx.vsprintf = vsprintf;
  })(I18n.prototype);



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
