// This is ugly, but we can't use `export =` and named exports
// within TypeScript, so we need to fake it here so our types
// resolve correctly in consumers.

const imports = require('./lib');

const { config, named } = imports;

Object.assign(config, named);

module.exports = config;
