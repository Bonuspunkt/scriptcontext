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

const emitter = new EventEmitter();

const config = {
    resolve: {
        func: () => console.log('func'),
        object: {
            func: () => console.log('object.func')
        }
    },
    subscribe: {
        emitter
    }
};

const scripts = [{
    file: 'filename (optional)',
    content: 'const objectFunc = resolve("object.func"); objectFunc();'
}, {
    content: 'const func = resolve("func"); subscribe("emitter.event", func);'
}];

const context = scriptcontext(config, scripts);
// console prints `object.func`
emitter.emit('event');
// console prints `func`

context.destroy();
```

## scriptcontext(config, scripts)

- `config`

see `lib/provider`

    - `resolve` <Object>

    - `scriptEvent` <Boolean>

    - `scriptFn` <Boolean>

    - `subscribe` <Object>

    - `onError` <Function>

    - `timeout` <Boolean>

- `scripts`


## install
```
npm install scriptcontext --save
```
