var path = require('path');

var config = {
  registryUrl: null,
  userCredentials: null,
  userEmail: null,
  sandbox: path.resolve(__dirname, '..', 'sandbox')
};

config.npmCache = path.resolve(config.sandbox, '_npm_cache');

module.exports = config;
