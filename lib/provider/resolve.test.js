const { describe, expect, test } = require('@jest/globals');
const resolveProvider = require('./resolve');

describe('resolve', () => {

    test('should resolve functions', () => {
        let executed = false;
        const func = () => { executed = true; };
        const { provide } = resolveProvider({
            resolve: { func }
        });

        const fn = provide.resolve('func');

        expect(executed).toBe(false);

        fn();

        expect(executed).toBe(true);
    });

    test('should resolve nested functions', () => {
        let executed = false;
        const func = () => { executed = true; };
        const { provide } = resolveProvider({
            resolve: { object: { func: func } }
        });

        const fn = provide.resolve('object.func');

        expect(executed).toBe(false);

        fn();

        expect(executed).toBe(true);

    });

    test('should not resolve non functions', () => {
        const { provide } = resolveProvider({
            resolve: { object: {} }
        });

        expect(() => provide.resolve('object')).toThrow(Error);
    });

});
