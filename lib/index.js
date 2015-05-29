var TIMEOUT_MAX = 2147483647; // 2^31-1
var Timeout = function (callback, delay/*,[arguments]*/) {

    var args = [];
    for (var i = 2, j = arguments.length; i < j; ++i) {
        args.push(arguments[i]);
    }

    this._callback = callback;
    this._delay = delay;
    this.start(args);
};

Timeout.prototype.start = function (args) {

    if (this._delay <= TIMEOUT_MAX) {
        args.unshift(this._callback, this._delay);
    }
    else {
        var self = this;
        var callback = function () {

            self._delay -= TIMEOUT_MAX;
            self.start(args);
        };
        args.unshift(callback, TIMEOUT_MAX);
    }
    this._timeout = setTimeout.apply(null, args);
};

Timeout.prototype.close = function () {

    clearTimeout(this._timeout);
};

var _setTimeout = function () {

    var result = Object.create(Timeout.prototype);
    Timeout.apply(result, arguments);
    return result;
};

var _clearTimeout = function (timer) {

    timer.close();
};

module.exports = {
    setTimeout: _setTimeout,
    clearTimeout: _clearTimeout
};
