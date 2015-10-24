'use strict';
const TIMEOUT_MAX = 2147483647; // 2^31-1

class Timeout {
  constructor (callback, delay, ...args) {
    this._callback = callback;
    this._delay = delay;
    this.start(args);
  }
  start (args) {
    let _args = args.slice(0);
    const max = module.exports._TIMEOUT_MAX;

    if (this._delay <= max) {
      _args = [this._callback, this._delay, ..._args];
    } else {
      const callback = () => {
        this._delay -= max;
        this.start(args);
      };
      _args = [callback, max, ..._args];
    }
    this._timeout = setTimeout(..._args);
  }
  close () {
    clearTimeout(this._timeout);
  }
}

const _setTimeout = (...args) => { return new Timeout(...args); };

const _clearTimeout = (timer) => { return timer.close(); };

module.exports = {
  setTimeout: _setTimeout,
  clearTimeout: _clearTimeout,
  _TIMEOUT_MAX: TIMEOUT_MAX
};
