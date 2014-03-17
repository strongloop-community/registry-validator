# registry-validator

Validate your npm registry implementation,
check if it correctly implements the npm protocol.

## Usage (CLI)

Install this module globally:

```sh
$ npm install -g registry-validator
```

Once your registry is up and running, run the validation:

```sh
$ registry-validator http://127.0.0.1:15984/ admin:pass
```

The validation suite uploads multiple dummy packages to the registry,
therefore you should always use a dedicated test-only instance of the registry
server.

It's recommented to reset the registry to an empty state before each run.

### CLI parameters

The first argument is the URL of the registry. Use the same value 
you pass to `--registry` option of `npm`.

The second argument is optional credentials to use for publishing test
packages. The format is `{login}:{password}`.


## Usage (programatic)

Add the module to your project

```sh
$ npm install --save-dev registry-validator
```

Create a new test file that will

 - start your registry server
 - run the validation test suite

```js
var validator = require('registry-validator');
var registry = require('../');

// assuming an express-based implementation
var app = registry();
app.listen(function() {
  var port = this.address().port;
  run('http://localhost:' + port);
});

function run(url) {
  validator
    .configure(url, {/* options - see below */})
    .run(function(err) {
      if (err) console.error(err);
      process.exit(err ? 1 : 0);
    });
});
```

**NOTE**

This module uses `mocha`, `bluebird` and `mocha-as-promised` internally.
While it should be possible to include this module in an application that uses
some of those three modules too, extra care must be taken to prevent
configuration conflicts. It may be easier to use the CLI or start the registry
in a child process in such case.

### Configuration options

 - `userCredentials` - `{String}` in the form of 'user:password'.
   The credentials to use for authentication of the registry requests.

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
