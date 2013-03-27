# A simple Meteor internationalization package

Simple internationalization using collections and session.

## How to install

1. Add the package `simple-i18n` to your `smart.json` file.
2. Run `mrt`

## Usage

1. Run `Meteor.I18n()` on the server to publish `current_language_records`.
2. Run `Meteor.I18n()` on the client to subscribe to `current_language_records`.

*You can pass some options to initialize the i18n package, see `I18n.prototype.init` for more info*

## How to add translations

Do something like this (server side):
```js
var translations = [
  {lang: 'pt-br', base_str: 'Hello', new_str: 'Olá'},
  {lang: 'de', base_str: 'Hello', new_str: 'Hallo'},
  {lang: 'es', base_str: 'Hello', new_str: 'Hola'},
  {lang: 'it', base_str: 'Hello', new_str: 'Ciao'}
];
var i18n = Meteor.I18n();

for (var i in translations) {
  if (!i18n.collection.findOne({lang: translations[i].lang, base_str: translations[i].base_str})) {
    i18n.insert(translations[i].lang, translations[i].base_str, translations[i].new_str);
  }
}
```

## Sample here!

[http://simple-i18n-sample.meteor.com/](http://simple-i18n-sample.meteor.com/)

## More info

[http://TXGruppi.github.com/meteor-simple-i18n/](http://TXGruppi.github.com/meteor-simple-i18n/)