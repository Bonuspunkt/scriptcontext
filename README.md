# scriptcontext
[![Build Status](https://travis-ci.org/Bonuspunkt/scriptcontext.svg?branch=master)](https://travis-ci.org/Bonuspunkt/scriptcontext)
[![codecov.io](https://img.shields.io/codecov/c/github/Bonuspunkt/scriptcontext.svg?branch=master)](https://codecov.io/gh/Bonuspunkt/scriptcontext?branch=master)
[![npm](https://img.shields.io/npm/v/scriptcontext.svg)](https://www.npmjs.com/package/scriptcontext)
[![license](https://img.shields.io/npm/l/scriptcontext.svg)](https://tldrlegal.com/license/-isc-license)

provides a context where you can run long living scripts that can be disposed.

it provides `resolve(<string>)`, `subscribe(<string>)`, `setTimeout` and `clearTimeout` to scripts.

**WARNING:** its only protected via `vm` it doesn't start a new child process. it will not protect you against `while(1);`

## install
```
npm install scriptcontext
```

## usage

look at `test/lib/scriptContext`
