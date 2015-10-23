# Big-Time
[![Build Status](https://travis-ci.org/continuationlabs/big-time.svg?branch=master)](https://travis-ci.org/continuationlabs/big-time)
[![npm](https://img.shields.io/npm/v/big-time.svg)](https://www.npmjs.com/package/big-time)

[![belly-button-style](https://cdn.rawgit.com/continuationlabs/belly-button/master/badge.svg)](https://github.com/continuationlabs/belly-button)

Reworking of [long-timeout](https://github.com/tellnes/long-timeout) that has more features, follows correct semver, and has unit tests. Big-Time is a custom timer class to allow really long values into `setTimeout` that are larger than Node would normally support (2^31-1).

## Usage

```js
var bt = require('big-time');

bt.setTimeout(function () {

    console.log('if you wait for this, it will eventually log');
}, Number.MAX_VALUE);

var timer = bt.setTimeout(function () {

    console.log('shorter');
}, 1000);
bt.clearTimeout(timer);
```

## API

### `bt.setTimeout(callback, delay, [arg1, arg2, arg3,...])`

Creates a new Big-Time timer object and starts the timer where:

- `callback` - the function to execute after `delay` milliseconds has passed. `callback` will be called with `arg1, arg2, arg3...` if they are passed into `setTimeout`, exactly like native `setTimeout`
- `delay` - the number of milliseconds to wait before executing `callback`. Must be an integer.
- `[arg1, arg2, arg3,...]` - optional `N` number of extra parameters that will be passed back into `callback`.

### `bt.clearTimeout(timer)`

Clears a running Big-Time object.
