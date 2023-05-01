const i18n = require('i18n');

i18n.configure({
  locales: ['fr', 'en'],
  fallbacks: 'en',
  objectNotation: true,
  directory: `${__dirname}/../../../locales`,
});

module.exports = i18n;