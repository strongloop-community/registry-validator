var path = require('path');
var extend = require('util')._extend;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var npm = require('npm');
var debug = require('debug')('registry-validator:npm');
var config = require('./config');

var loadConfig = Promise.promisify(npm.load, npm);

exports = module.exports = executeNpmCommand;

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
    .then(function() {
      debug('executing %s %j', command, args);
      return callCommand(args, command);
    });
}

function callCommand(args, command) {
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

function getConfig(options) {
  var result = extend({
    userconfig: './user.npmrc',     // missing by default
    globalconfig: './global.npmrc', // missing by default
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
