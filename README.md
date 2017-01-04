# scriptcontext
[![Build Status](https://travis-ci.org/Bonuspunkt/scriptcontext.svg?branch=master)](https://travis-ci.org/Bonuspunkt/scriptcontext)
[![codecov.io](https://img.shields.io/codecov/c/github/Bonuspunkt/scriptcontext.svg?branch=master)](https://codecov.io/gh/Bonuspunkt/scriptcontext?branch=master)
[![npm](https://img.shields.io/npm/v/scriptcontext.svg)](https://www.npmjs.com/package/scriptcontext)
[![license](https://img.shields.io/npm/l/scriptcontext.svg)](https://tldrlegal.com/license/-isc-license)

provides a disposable sandbox for scripts

**WARNING:** its only protected via `vm` it doesn't start a new child process. it will not protect you against `while(1);`

## how to use
``` js
const { EventEmitter } = require('events');
const scriptContext = require('scriptcontext');

const provide = {
    func: () => console.log('func'),
    object: {
        func: () => console.log('object.func')
    },
    emitter: new EventEmitter()
};

const scripts = [{
    file: 'filename (optional)',
    content: 'const objectFunc = resolve("object.func"); objectFunc();'
}, {
    content: 'const func = resolve("func"); subscribe("emitter.event", func);'
}];

const context = scriptcontext({ provide }, scripts);
// console prints `object.func`
provide.emitter.emit('event');
// console prints `func`

context.destroy();
```

## scriptcontext(config, scripts)

- `config`

    - `provide`

        defaults to `{}`

    - `canProvideFn`

        defaults to `true`

    - `canProvideEvent`

        defaults to `true`

- `scripts`

## available to scripts
### default

- `resolve(string)`

    to access a function, which was provided via `config.provide`.

    **NOTE:** you have to ensure the return values are not exposing dangerous stuff (ex. `require`)

- `subscribe(string, fn)`

    to register a listener to a EventEmitter, which was provided via `config.provide`.

- `unsubscribe(string, fn)`

    to unregister a function from a EventEmitter, which was provided via `config.provide`.

- `setTimeout(callback, delay[, ...args])`

    [same as in node](https://nodejs.org/api/timers.html#timers_settimeout_callback_delay_args)

- `clearTimeout(timeout)`

    [same as in node](https://nodejs.org/api/timers.html#timers_cleartimeout_timeout)

### canProvideFn

- provideFn(alias, fn)

- scriptResolve(alias)

### canProvideEvent

- provideEvent(eventName)

- scriptSubscribe(eventName, fn)

- scriptUnsubscribe(eventName, fn)


## install
```
npm install scriptcontext --save
```
