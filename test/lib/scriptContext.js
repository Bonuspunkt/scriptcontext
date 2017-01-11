/* eslint quotes: 0 */
const expect = require('chai').expect;
const scriptContext = require('../../lib/scriptContext');

describe('scriptContext', () => {

    describe('security', () => {

        it('should not be exploitable via constructor', () => {
            const context = scriptContext({}, [{
                file: 'exploit.js',
                content: `new Function("return (this.constructor.constructor('return (this.process.mainModule.constructor._load)')())")()("util").inspect("hi")`
            }]);

            expect(context.scriptResult.length).to.equal(1);
            const exploit = context.scriptResult[0];
            expect(exploit.success).to.equal(false);
        });

        it('should not be possible to override sandbox buildins', () => {
            const context = scriptContext({ timeout: true }, [{
                content: 'setTimeout = () => {};'
            }]);

            const allExecuted = context.scriptResult.every(r => r.success);
            expect(allExecuted).to.equal(false);
        });

        it('should return the correct line number at error', () => {
            const context = scriptContext({}, [{
                file: 'file.js',
                content: `throw Error('NOPE')`
            }]);

            const [script] = context.scriptResult;
            const { error } = script;
            const { stack } = error;

            const result = /at .*:(\d+):(\d+)/.exec(stack);
            expect(result).to.be.not.equal(null);

            const line = Number(result[1]);
            expect(line).to.equal(1);

        });
    });

});
