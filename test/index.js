'use strict';
const Lab = require('lab');
const BigTime = require('../lib');

const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const expect = Lab.expect;

const internals = {
  ignore: () => {}
};

describe('Timeout', () => {
  describe('setTimeout()', () => {
    it('returns a new Timeout object', (done) => {
      const result = BigTime.setTimeout(done, 100);
      expect(result._callback).to.be.a.function();
      expect(result._delay).to.equal(100);
      expect(result._timeout._idleTimeout).to.equal(100);
    });

    it('will allow really large numbers that built-in setTimeout will not', (done) => {
      const result = BigTime.setTimeout(internals.ignore, 3000000000);
      expect(result._callback).to.be.a.function();
      expect(result._delay).to.equal(3000000000);
      expect(result._timeout._idleTimeout).to.equal(2147483647);

      // We don't want to wait for this to finish
      clearTimeout(result._timeout);
      done();
    });

    it('will adjust the remaining timeout after a run for really large numbers', (done) => {
      // Make testing easier
      const max = BigTime._TIMEOUT_MAX;
      var result;
      BigTime._TIMEOUT_MAX = 1000;

      const orig = setTimeout;
      let counter = 3;
      process.nextTick(() => {
        setTimeout = (...args) => {  // eslint-disable-line no-global-assign, no-undef
          counter--;
          expect(result._delay).to.be.between((counter * 1000 - 1), ((counter + 1) * 1000));
          expect(args).to.have.length(4);
          orig.apply(null, args);
        };
      });

      result = BigTime.setTimeout((...args) => {
        expect(args[0]).to.equal('john doe');
        expect(args[1]).to.be.true();
        expect(args).to.have.length(2);
        setTimeout = orig;  // eslint-disable-line no-global-assign, no-undef
        BigTime._TIMEOUT_MAX = max;
        // 1 because there is a setTimeout we don't catch due to needed process.nextTick and the real setTimeout is called.
        expect(counter).to.equal(1);
        done();
      }, 3000, 'john doe', true);
    });

    it('passes arguments through like native setTimeout', (done) => {
      BigTime.setTimeout((x, y, z) => {
        expect(x).to.equal('foo');
        expect(y).to.equal('bar');
        expect(z).to.equal('baz');
        done();
      }, 100, 'foo', 'bar', 'baz');
    });
  });

  describe('clearTimeout()', () => {
    it('cleans up all of the setTimeout objects', (done) => {
      const result = BigTime.setTimeout(internals.ignore, 100);
      expect(result._callback).to.be.a.function();
      expect(result._delay).to.equal(100);
      expect(result._timeout._idleTimeout).to.equal(100);

      setImmediate(() => {
        BigTime.clearTimeout(result);
        expect(result._timeout._idleTimeout).to.equal(-1);
        done();
      });
    });
    it('is a no-op when passing a falsy value', (done) => {
      expect(() => {
        BigTime.clearTimeout(undefined);
        BigTime.clearTimeout(null);
        BigTime.clearTimeout(true);
      }).to.not.throw();
      done();
    });
  });

  describe('ref() and unref()', () => {
    it('toggles ref value', (done) => {
      const timer = BigTime.setTimeout(internals.ignore, BigTime._TIMEOUT_MAX);
      let result;

      expect(timer._ref).to.equal(true);
      result = timer.unref();
      expect(timer._ref).to.equal(false);
      expect(result).to.shallow.equal(timer);
      result = timer.ref();
      expect(timer._ref).to.equal(true);
      expect(result).to.shallow.equal(timer);
      done();
    });

    it('retains ref state when timers are adjusted', (done) => {
      const max = BigTime._TIMEOUT_MAX;
      const orig = setTimeout;
      BigTime._TIMEOUT_MAX = 500;
      const result = BigTime.setTimeout(() => {
        expect(result._ref).to.equal(false);
        done();
      }, 1000);

      expect(result._ref).to.equal(true);
      result.unref();
      expect(result._ref).to.equal(false);

      setTimeout = (...args) => {  // eslint-disable-line no-global-assign, no-undef
        setTimeout = orig;  // eslint-disable-line no-global-assign, no-undef
        BigTime._TIMEOUT_MAX = max;
        expect(result._ref).to.equal(false);
        return orig.apply(null, args);
      };
    });
  });
});
