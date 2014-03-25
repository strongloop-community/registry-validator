var path = require('path');
var extend = require('util')._extend;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var debug = require('debug')('registry-validator:npm');
var config = require('./config');

exports.install = function(workingDir, packageSpecifier) {
  return executeNpmCommand('install', workingDir, packageSpecifier);
};

exports.publish = function(dirOrTarball) {
  return executeNpmCommand('publish', [dirOrTarball]);
};

exports.tag = function(nameAtVersion, tag) {
  return executeNpmCommand('tag', [nameAtVersion, tag]);
};

exports.update = function(workingDir, modulesToUpdate) {
  return executeNpmCommand(
    { prefix: workingDir },
    'update',
    modulesToUpdate || []);
};

/**
 * @param options npm config
 * @param command command to execute, e.g. `publish`
 * @param {...*} cmdArgs arguments to pass to the npm command
 * @returns {Promise}
 */
function executeNpmCommand(options, command, cmdArgs) {
  var args;
  if (typeof options == 'string') {
    args = Array.prototype.slice.call(arguments, 1);
    command = arguments[0];
    options = {};
  } else {
    args = Array.prototype.slice.call(arguments, 2);
  }
  var npmConf = getConfig(options);

  debug('npm cache: %j', npmConf.cache);
  return fs.removeAsync(npmConf.cache)
    .then(function() {
      return fs.mkdirsAsync(npmConf.cache);
    })
    .then(function() {
      debug('loading %j', npmConf);
      return loadConfig(npmConf);
    })
    .then(function(npm) {
      debug('executing %s %j', command, args);
      return callCommand(npm, command, args);
    });
}

function callCommand(npm, command, args) {
  var _log = console.log;
  console.log = function() {
    debug.apply(debug, arguments);
  };

  return new Promise(function(resolve, reject) {
    args.push(callback);
    npm.commands[command].apply(npm.commands, args);

    function callback(err) {
      if (!err) {
        debug('npm ' + command + ' successfully finished');
        return resolve();
      }

      var prefix = 'npm ' + command + ' failed: ';
      if (typeof err == 'string')
        err = new Error(prefix + err);
      else if (!err instanceof Error) {
        err = new Error(prefix + JSON.stringify(err));
      }
      debug('npm ' + command + ' failed with %s', err);
      reject(err);
    }
  }).finally(function() {
    console.log = _log;
  });
}

function loadConfig(options) {
  // npm remembers whether the config was loaded
  // and skips config loading when called second time
  // we have to remove npm from the require cache to force
  // config reload
  purgeNpmFromRequireCache();
  var npm = require('npm');
  var load = Promise.promisify(npm.load, npm);
  return load(options)
    .then(function() {
      // Monkey patch npm-registry-client to include
      // HTTP response details in error objects
      npm.registry.request = createErrorPatchingRequest(npm.registry.request);
    })
    .return(npm);
}

function createErrorPatchingRequest(request) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var cb = args.pop();

    args.push(function patchCallback(err, remoteData, raw, response) {
      if (err && response) {
        err.statusCode = response.statusCode;
      }
      cb.apply(this, arguments);
    });

    request.apply(this, args);
  };
}

function purgeNpmFromRequireCache() {
  var npmRoot = path.dirname(require.resolve('npm/package.json'));
  var prefix = npmRoot + path.sep;
  var modulesPrefix = path.join(npmRoot, 'node_modules') + path.sep;

  for (var key in  require.cache) {
    // Check if this is a file inside npm tree
    if (key.substr(0, prefix.length) != prefix) continue;
    // Check if this is an own file of npm, not a sub-module in node_modules
    if (key.substr(0, modulesPrefix.length) == modulesPrefix) continue;
    // Purge such file
    delete require.cache[key];
  }
}

function getConfig(options) {
  var result = extend({
    // the following two paths intentionally point to non-existing files
    userconfig: path.resolve(config.sandbox, 'user.npmrc'),
    globalconfig: path.resolve(config.sandbox, 'global.npmrc'),
    cache: config.npmCache,
    registry: config.registryUrl
  }, options);

  if (result._auth === undefined && config.userCredentials != null)
    result._auth = new Buffer(config.userCredentials).toString('base64');
  if (result.email === undefined && config.userEmail != null)
    result.email = config.userEmail;

  result.color = false;
  result.logstream = new DebugStream();

  return result;
}

//--- DebugStream ----//

var Writable = require('stream').Writable;
var inherits = require('util').inherits;

function DebugStream() {
  Writable.call(this, { decodeStrings: false });
  this.buffer = '';
}
inherits(DebugStream, Writable);

DebugStream.prototype._write = function(chunk, encoding, callback) {
  this.buffer += chunk.toString();
  if (this.buffer.indexOf('\n') != -1) {
    var lines = this.buffer.split(/\n/g);
    this.buffer = lines.pop();
    lines.forEach(function(l) { debug(l); });
  }
  callback();
};
