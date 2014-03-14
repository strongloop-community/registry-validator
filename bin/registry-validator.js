#!/usr/bin/env node

var validator = require('../');

if (process.argv.length < 3) {
  console.log('Usage:\n' +
      '    registry-validator {url} [login:password]\n');
  process.exit(1);
}

validator
  .configure(process.argv[2], {
    userCredentials: process.argv[3]
  })
  .run(function(err) {
    process.exit(err ? 1 : 0);
  });
