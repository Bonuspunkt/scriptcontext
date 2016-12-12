# scriptcontext
provides a context where you can run long living scripts that can be disposed.

it provides `resolve(<string>)`, `subscribe(<string>)`, `setTimeout` and `clearTimeout` to scripts.

**WARNING:** its only protected via `vm` it doesn't start a new child process. it will not protect you against `while(1);`

## install
```
npm install scriptcontext
```

## usage

look at `test/lib/scriptContext`
