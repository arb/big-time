'use strict';
var Code = require('code');
var Lab = require('lab');
var BigTime = require('../src');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

var internals = {
  ignore: function () {}
};

describe('Timeout', function () {
  describe('setTimeout()', function () {
    it('returns a new Timeout object', function (done) {
      var result = BigTime.setTimeout(done, 100);
      expect(result._callback).to.be.a.function();
      expect(result._delay).to.equal(100);
      expect(result._timeout._idleTimeout).to.equal(100);
    });

    it('will allow really large numbers that built-in setTimeout will not', function (done) {
      var result = BigTime.setTimeout(internals.ignore, 3000000000);
      expect(result._callback).to.be.a.function();
      expect(result._delay).to.equal(3000000000);
      expect(result._timeout._idleTimeout).to.equal(2147483647);

      // We don't want to wait for this to finish
      clearTimeout(result._timeout);
      done();
    });

    it('will adjust the remaining timeout after a run for really large numbers', function (done) {
      // Make testing easier
      var max = BigTime._TIMEOUT_MAX;
      BigTime._TIMEOUT_MAX = 1000;

      var orig = setTimeout;
      var counter = 3;
      process.nextTick(function () {
        setTimeout = function () {  // eslint-disable-line no-native-reassign, no-undef
          counter--;
          expect(result._delay).to.be.between((counter * 1000 - 1), ((counter + 1) * 1000));
          expect(arguments).to.have.length(4);
          orig.apply(null, arguments);
        };
      });

      var result = BigTime.setTimeout(function (name, foo) {
        expect(name).to.equal('john doe');
        expect(foo).to.be.true();
        expect(arguments).to.have.length(2);
        setTimeout = orig;  // eslint-disable-line no-native-reassign, no-undef
        BigTime._TIMEOUT_MAX = max;
        // 1 because there is a setTimeout we don't catch due to needed process.nextTick and the real setTimeout is called.
        expect(counter).to.equal(1);
        done();
      }, 3000, 'john doe', true);
    });

    it('passes arguments through like native setTimeout', function (done) {
      BigTime.setTimeout(function (x, y, z) {
        expect(x).to.equal('foo');
        expect(y).to.equal('bar');
        expect(z).to.equal('baz');
        done();
      }, 100, 'foo', 'bar', 'baz');
    });
  });

  describe('clearTimeout()', function () {
    it('cleans up all of the setTimeout objects', function (done) {
      var result = BigTime.setTimeout(internals.ignore, 100);
      expect(result._callback).to.be.a.function();
      expect(result._delay).to.equal(100);
      expect(result._timeout._idleTimeout).to.equal(100);

      process.nextTick(function () {
        BigTime.clearTimeout(result);
        expect(result._timeout._idleTimeout).to.equal(-1);
        done();
      });
    });
  });
});
