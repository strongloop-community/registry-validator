#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log('Usage:\n' +
      '    registry-validator {url} [login:password]\n');
  process.exit(1);
}

global.registryUrl = process.argv[2];
global.options = {
  userCredentials: process.argv[3] || ''
};

var Mocha = require('mocha');
var mocha = new Mocha();

mocha.reporter('spec');
mocha.ui = 'bdd';
mocha.files = [require.resolve('../lib/run')];

mocha.run(process.exit);


