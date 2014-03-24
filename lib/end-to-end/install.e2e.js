var fs = require('fs-extra');
var path = require('path');
var debug = require('debug')('registry-validator:end-to-end:install');
var expect = require('chai').expect;

var npm = require('../npm-exec');
var config = require('../config');
var given = require('../given');

describe('install', function() {
  var targetDir;

  it('downloads correct package contents', function() {
    return given.publishedPackage()
      .then(function(pkg) {
        return npm.install(targetDir, pkg.nameAtVersion).return(pkg);
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

  it('downloads correct version', function() {
    return given.publishedPackage({ version: '1.0.0' })
      .then(function(pkg) {
        pkg.version = '1.0.1';
        return given.publishedPackage(pkg);
      })
      .then(function(pkg) {
        return npm.install(targetDir, pkg.name + '@~1.0.0').return(pkg);
      })
      .then(function(pkg) {
        var meta = require(targetDir + '/node_modules/' +
                           pkg.name + '/package.json');
        expect(meta.version).to.equal('1.0.1');
      });
  });

  it('returns error when package name does not exist', function() {
    return npm.install(targetDir, 'unknown-package')
      .then(installShouldHaveFailed, expectErrorWithStatusCode(404));
  });

  it('returns error when package version does not exist', function() {
    var req;
    return given.publishedPackage({ version: '1.0.0' })
      .then(function(pkg) {
        req = pkg.name + '@2.0.0';
        return npm.install(targetDir, req);
      })
      .then(installShouldHaveFailed, expectErrorWithStatusCode(404));
  });

  beforeEach(function() {
    targetDir = config.resolveSandboxPath('target');
    fs.removeSync(targetDir);
    fs.mkdirsSync(targetDir);
  });

  function installShouldHaveFailed() {
    throw new Error('npm install should have failed');
  }

  function expectErrorWithStatusCode(code) {
    return function(err) {
      expect(err.statusCode).to.equal(code);
    };
  }
});
