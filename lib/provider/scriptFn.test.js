const { describe, expect, test } = require('@jest/globals');
const scriptFnProvider = require('./scriptFn');

describe('provide functions', () => {

    test('should be able to provide functions', () => {
        let executed = false;
        const { provide } = scriptFnProvider({ scriptFn: true });
        const { provideFn, scriptResolve } = provide;

        provideFn('customExec', () => { executed = true; });
        const customExec = scriptResolve('customExec');

        expect(executed).toBe(false);

        customExec();

        expect(executed).toBe(true);
    });

    test('should not be able to register same function twice', () => {

        const { provide } = scriptFnProvider({ scriptFn: true });
        const { provideFn } = provide;

        expect(() => provideFn('name', () => { })).not.toThrow();
        expect(() => provideFn('name', () => { })).toThrow(Error);
    });

    test('should not be possibe to register other than functions', () => {

        const { provide } = scriptFnProvider({ scriptFn: true });
        const { provideFn } = provide;

        expect(() => provideFn('name', 1)).toThrow(Error);
        expect(() => provideFn('name', 'text')).toThrow(Error);
        expect(() => provideFn('name', /regExp/)).toThrow(Error);
        expect(() => provideFn('name', new Date())).toThrow(Error);
        expect(() => provideFn('name', {})).toThrow(Error);
        expect(() => provideFn('name', [])).toThrow(Error);
    });

});
