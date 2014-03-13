# registry-validator

Validate your npm registry implementation,
check if it correctly implements the npm protocol.

## Usage

Install mocha, registry-validator and bluebird promises to your project:

```sh
$ npm install --save-dev mocha bluebird registry-validator
```

Create a new test file that will

 - start your registry server
 - run the validation test suite

```js
var validate = require('registry-validator');
var Promise = require('bluebird');
var registry = require('../');

var registryUrlPromise = new Promise(function(resolve, reject) {
  // assuming express-based implementation
  var app = registry();
  app
    .listen(function() {
      var port = app.address().port;
      resolve('http://localhost:' + port);
    })
    .on('error', function(err) {
      reject(err);
    });
});

describe('my registry', function() {
  validate(registryUrlPromise, {
    // Configuration options as described below
    userCredentials: 'admin:password'
  });
}
```


## Options

 - `userCredentials` - `{String}` in the form of 'user:password'. 
   The credentials to use for authentication of the registry requests.

## CLI

If you have installed this module globally, you can run the validation using
the following command.

```sh
$ registry-validator http://127.0.0.1:15984/ admin:pass
```

Don't forget to reset your registry to an empty state before each run!

## Self-test

The module comes with infrastructure to run the validation against the official
CouchDB based [registry application](https://github.com/npm/npmjs.org).

To run the tests, you must have CouchDB installed and the `couchdb` executable
must be in your PATH.

Use the usual `npm test` command to run the self-test.

## Troubleshooting

If the assertion message does not include enough details to identify the
problem, set the environment variable `DEBUG=registry-validator:*`
and re-run the failing test. Debug logs contain the output from 
the `npm` client among other things.
