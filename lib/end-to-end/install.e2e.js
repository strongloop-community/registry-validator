var fs = require('fs-extra');
var path = require('path');
var debug = require('debug')('registry-validator:end-to-end:install');
var expect = require('chai').expect;

var npm = require('../npm-exec');
var config = require('../config');
var given = require('../given');

describe('install', function() {
  it('downloads correct package contents', function() {
    var targetDir = config.resolveSandboxPath('target');

    return given.publishedPackage()
      .then(function(pkg) {
        fs.mkdirs(targetDir);
        return npm('install', targetDir, pkg.nameAtVersion).return(pkg);
      }).then(function(pkg) {
        var installedIndex = path.resolve(
          targetDir, 'node_modules', pkg.name, 'index.js');
        var originalIndex = path.resolve(pkg.path, 'index.js');

        expect(fs.existsSync(installedIndex), 'index.js exists')
          .to.equal(true);

        expect(fs.readFileSync(installedIndex, 'utf-8'), 'index.js content')
          .to.equal(fs.readFileSync(originalIndex, 'utf-8'));
      });
  });
});
