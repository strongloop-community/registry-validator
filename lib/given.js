var extend = require('util')._extend;
var path = require('path');
var fs = require('fs-extra');
var SANDBOX = require('./config').sandbox;

var packageNameCounter = 0;
exports.package = function(packageJson) {
  var defaults = {
    'name': 'test-module-' + (++packageNameCounter),
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
