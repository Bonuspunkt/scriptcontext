/* eslint quotes: 0 */
const { describe, expect, test } = require('@jest/globals');
const scriptContext = require('./scriptContext');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('scriptContext', () => {

    describe('security', () => {

        test('should not be exploitable via constructor', () => {
            const context = scriptContext({}, [{
                file: 'exploit.js',
                content: `new Function("return (this.constructor.constructor('return (this.process.mainModule.constructor._load)')())")()("util").inspect("hi")`
            }]);

            expect(context.scriptResult).toHaveLength(1);
            const exploit = context.scriptResult[0];
            expect(exploit.success).toBe(false);
        });

        test('should return the correct line number at error', () => {
            const context = scriptContext({}, [{
                file: 'file.js',
                content: `throw Error('NOPE')`
            }]);

            const [script] = context.scriptResult;
            const { error } = script;
            const { stack } = error;

            const result = /at .*:(\d+):(\d+)/.exec(stack);
            expect(result).not.toBeNull();

            const line = Number(result[1]);
            expect(line).toBe(1);
        });
    });


    test('destroy should call provider destroy method', async () => {
        let executed = false;
        const context = scriptContext({
            resolve: { execute: () => { executed = true; } },
            timeout: true
        }, [{
            file: 'timeout.js',
            content: 'setTimeout(() => resolve(execute), 0);'
        }]);

        const { scriptResult, destroy } = context;
        expect(scriptResult).toEqual([{ file: 'timeout.js', success: true }]);

        destroy();

        delay(1);
        expect(executed).toBe(false);
    });
});
