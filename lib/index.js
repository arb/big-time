'use strict';
const TIMEOUT_MAX = 2147483647; // 2^31-1

class Timeout {
  constructor (callback, delay, ...args) {
    this._callback = callback;
    this._delay = delay;
    this._timeout = null;
    this.start(args);
  }
  start (args) {
    const max = module.exports._TIMEOUT_MAX; // Use the exported value for testing purposes.

    if (this._delay <= max) {
      this._timeout = setTimeout(this._callback, this._delay, ...args);
    } else {
      const callback = () => {
        this._delay -= max;
        this.start(args);
      };

      this._timeout = setTimeout(callback, max, ...args);
    }
  }
  close () {
    clearTimeout(this._timeout);
  }
}

const _setTimeout = (...args) => { return new Timeout(...args); };

const _clearTimeout = (timer) => { timer && typeof timer.close === 'function' && timer.close(); };

module.exports = {
  setTimeout: _setTimeout,
  clearTimeout: _clearTimeout,
  _TIMEOUT_MAX: TIMEOUT_MAX
};
