var extend = require('util')._extend;
var path = require('path');
var fs = require('fs-extra');
var SANDBOX = require('./config').sandbox;
var npm = require('./npm-exec');

var given = exports;

var packageNamePrefix = 'test-' + (new Date().getTime()) + '-module-';
var packageNameCounter = 0;

given.packageSync = function(packageJson) {
  var defaults = {
    'name': packageNamePrefix + (++packageNameCounter),
    'version': '0.1.0',
    'description': 'a test module',
    'main': 'index.js',
    'author': 'me',
    'license': 'BSD'
  };

  packageJson = extend(defaults, packageJson);
  var pkgDir = path.resolve(SANDBOX,
    packageJson.name + '-' + packageJson.version);

  fs.removeSync(pkgDir);
  fs.mkdirsSync(pkgDir);

  fs.writeJsonSync(path.resolve(pkgDir, 'package.json'), packageJson);
  fs.writeFileSync(path.resolve(pkgDir, 'index.js'), '// empty');

  return {
    path: pkgDir,
    name: packageJson.name,
    version: packageJson.version,
    nameAtVersion: packageJson.name + '@' + packageJson.version
  };
};

given.publishedPackage = function(packageJson) {
  var pkg = given.packageSync(packageJson);
  return npm('publish', [pkg.path]).then(function() { return pkg; });
};
