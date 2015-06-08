let TIMEOUT_MAX = 2147483647; // 2^31-1

class Timeout {
    constructor (callback, delay, ...args) {

        this._callback = callback;
        this._delay = delay;
        this.start(args);
    }
    start (args) {
        // Edit this copy instead of the original to prevent changing args
        // on every tick
        let self = this;
        let _args = args.slice(0);
        let max = module.exports._TIMEOUT_MAX;

        if (this._delay <= max) {
            _args.unshift(this._callback, this._delay);
        }
        else {
            let callback = function () {

                self._delay -= max;
                self.start(args);
            };
            _args.unshift(callback, max);
        }
        this._timeout = setTimeout.apply(null, _args);
    }
    close () {

        clearTimeout(this._timeout);
    }
}

const _setTimeout = function () {

    var result = Object.create(Timeout.prototype);
    Timeout.apply(result, arguments);
    return result;
};

const _clearTimeout = function (timer) {

    timer.close();
};

module.exports = {
    setTimeout: _setTimeout,
    clearTimeout: _clearTimeout,
    _TIMEOUT_MAX: TIMEOUT_MAX
};
