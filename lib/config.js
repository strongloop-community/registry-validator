var path = require('path');

var config = {
  registryUrl: null,
  userCredentials: null,
  userEmail: 'registry-validator@localhost',
  sandbox: path.resolve(__dirname, '..', 'sandbox')
};

config.resolveSandboxPath = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(config.sandbox);
  return path.resolve.apply(path, args);
};

config.npmCache = config.resolveSandboxPath('_npm_cache');

module.exports = config;
