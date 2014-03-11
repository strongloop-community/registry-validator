require('mocha-as-promised')();

var debug = require('debug')('registry-validator');

module.exports = function validate(registryUrlPromise) {
  describe('The Registry', function() {
    before(function() {
      return registryUrlPromise
        .bind(this)
        .then(function(url) {
          this.registryUrl = url;
        });
    });

    it('works', function() {
      debug('Registry URL', this.registryUrl);
    });
  });
};
