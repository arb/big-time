/* eslint-env jest */
const expect = require('expect');
const BigTime = require('../lib');

const noop = () => {};

describe('Timeout', () => {
  describe('setTimeout()', () => {
    it('will allow really large numbers that built-in setTimeout will not', (done) => {
      const result = BigTime.setTimeout(noop, 3000000000);
      expect(result._delay).toEqual(3000000000);
      expect(result._timeout._idleTimeout).toEqual(2147483647);

      // We don't want to wait for this to finish
      clearTimeout(result._timeout);
      done();
    });

    it('will adjust the remaining timeout after a run for really large numbers', (done) => {
      // Make testing easier
      const max = BigTime._TIMEOUT_MAX;
      let result;
      BigTime._TIMEOUT_MAX = 1000;

      const orig = setTimeout;
      let counter = 3;
      process.nextTick(() => {
        setTimeout = (...args) => { // eslint-disable-line no-global-assign, no-undef
          counter -= 1;
          expect(result._delay).toBeLessThanOrEqual(counter * 1000);
          expect(result._delay).toBeGreaterThanOrEqual(counter * 1000);
          expect(args).toHaveLength(4);
          orig(...args);
        };
      });

      result = BigTime.setTimeout((...args) => {
        expect(args[0]).toEqual('john doe');
        expect(args[1]).toEqual(true);
        expect(args).toHaveLength(2);
        setTimeout = orig; // eslint-disable-line no-global-assign, no-undef
        BigTime._TIMEOUT_MAX = max;
        // 1 because there is a setTimeout we don't
        // catch due to needed process.nextTick and the real setTimeout is called.
        expect(counter).toEqual(1);
        done();
      }, 3000, 'john doe', true);
    });

    it('passes arguments through like native setTimeout', (done) => {
      BigTime.setTimeout((x, y, z) => {
        expect(x).toEqual('foo');
        expect(y).toEqual('bar');
        expect(z).toEqual('baz');
        done();
      }, 100, 'foo', 'bar', 'baz');
    });

    it('supports Date instances as the delay', (done) => {
      const now = Date.now();

      BigTime.setTimeout(() => {
        const finished = Date.now();
        // Make sure that roughly a second has passed. Allow for some wiggle
        // room on slow CI machines.
        expect(finished - now).toBeGreaterThan(800);
        expect(finished - now).toBeLessThan(1500);
        done();
      }, new Date(now + 1000));
    });
  });

  describe('clearTimeout()', () => {
    it('cleans up all of the setTimeout objects', (done) => {
      const result = BigTime.setTimeout(noop, 100);
      expect(result._callback).toBeInstanceOf(Function);
      expect(result._delay).toEqual(100);
      expect(result._timeout._idleTimeout).toEqual(100);

      setImmediate(() => {
        BigTime.clearTimeout(result);
        expect(result._timeout._idleTimeout).toEqual(-1);
        done();
      });
    });
    it('is a no-op when passing a falsy value', (done) => {
      expect(() => {
        BigTime.clearTimeout(undefined);
        BigTime.clearTimeout(null);
        BigTime.clearTimeout(true);
      }).not.toThrow();
      done();
    });
  });

  describe('ref() and unref()', () => {
    it('toggles ref value', (done) => {
      const timer = BigTime.setTimeout(noop, BigTime._TIMEOUT_MAX);
      let result;

      expect(timer._ref).toEqual(true);
      result = timer.unref();
      expect(timer._ref).toEqual(false);
      expect(result).toBe(timer);
      result = timer.ref();
      expect(timer._ref).toEqual(true);
      expect(result).toBe(timer);
      done();
    });

    it('retains ref state when timers are adjusted', (done) => {
      const max = BigTime._TIMEOUT_MAX;
      const orig = setTimeout;
      BigTime._TIMEOUT_MAX = 500;
      const result = BigTime.setTimeout(() => {
        expect(result._ref).toEqual(false);
        done();
      }, 1000);

      expect(result._ref).toEqual(true);
      result.unref();
      expect(result._ref).toEqual(false);

      setTimeout = (...args) => { // eslint-disable-line no-global-assign, no-undef
        setTimeout = orig; // eslint-disable-line no-global-assign, no-undef
        BigTime._TIMEOUT_MAX = max;
        expect(result._ref).toEqual(false);
        return orig(...args);
      };
    });
  });
});
