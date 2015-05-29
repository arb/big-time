var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var BigTime = require('../');

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

            var real = setTimeout;
            setTimeout = function (func, delay, name) {

                process.nextTick(function () {

                    result.start = function () {

                        expect(name).to.equal('john doe');
                        expect(result._delay).to.equal(852516353);
                        setTimeout = real;
                        done();
                    };
                    return real(func, 100);
                });
            };

            var result = BigTime.setTimeout(internals.ignore, 3000000000, 'john doe');
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
