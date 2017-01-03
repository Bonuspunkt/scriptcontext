/* eslint quotes: 0 */
const { EventEmitter } = require('events');
const expect = require('chai').expect;
const scriptContext = require('../../lib/scriptContext');

const scriptOk = scriptResult => {
    const failed = scriptResult.some(script => !script.success);
    expect(failed).to.equal(false);
};

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

        it('should not be possible to store data at functions', () => {
            const config = {
                fn: () => {}
            };

            const context = scriptContext(config, [{
                content: 'resolve("fn").data = true'
            }]);

            const { scriptResult } = context;
            expect(scriptResult.length).to.equal(1);
            const object = scriptResult[0];
            expect(object.success).to.equal(true);

            expect(config.fn.data).to.not.equal(true);
        });

        it('should not be possible to override sandbox buildins', () => {
            const config = {};

            const context = scriptContext(config, [{
                content: 'resolve = () => {};'
            }]);

            const allExecuted = context.scriptResult.every(r => r.success);
            expect(allExecuted).to.equal(false);
        });

    });

    describe('resolve', () => {

        it('should resolve functions', () => {
            const context = scriptContext({
                func: () => {},
            }, [{
                file: 'object.js',
                content: 'resolve("func")'
            }]);

            const { scriptResult } = context;
            scriptOk(scriptResult);
        });

        it('should resolve nested functions', () => {
            const context = scriptContext({
                object: {
                    func: () => {}
                }
            }, [{
                file: 'objectFunc.js',
                content: 'resolve("object.func")'
            }]);

            const { scriptResult } = context;
            scriptOk(scriptResult);
        });

        it('should not resolve non functions', () => {
            const context = scriptContext({
                object: {}
            }, [{
                file: 'object.js',
                content: 'resolve("object")'
            }]);

            const { scriptResult } = context;
            expect(scriptResult.length).to.equal(1);
            const [script] = scriptResult;
            expect(script.success).to.equal(false);
        });

    });

    describe('subscribe', () => {

        it('should be able to subscribe to eventemitter', () => {
            const emitter = new EventEmitter();

            let executedCount = 0;
            const config = {
                emitter,
                execute: () => executedCount++
            };
            const files = [{
                file: 'script1.js',
                content: 'const execute = resolve("execute"); subscribe("emitter.event", execute);'
            }];


            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executedCount).to.equal(0);

            emitter.emit('event');

            expect(executedCount).to.equal(1);
        });

        it('should be able to handle multiple subscriptions', () => {
            const emitter = new EventEmitter();

            let executedCount = 0;
            const config = {
                emitter,
                execute: () => executedCount++
            };
            const files = [
                { content: 'const execute = resolve("execute"); subscribe("emitter.event", execute);'},
                { content: 'const execute = resolve("execute"); subscribe("emitter.event", execute);'}
            ];

            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executedCount).to.equal(0);

            emitter.emit('event');

            expect(executedCount).to.equal(2);
        });

        it('should not handle events after destroy', () => {
            const emitter = new EventEmitter();

            let executedCount = 0;
            const config = {
                emitter,
                execute: () => executedCount++
            };
            const files = [{
                file: 'script1.js',
                content: 'const execute = resolve("execute"); subscribe("emitter.event", execute);'
            }];


            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executedCount).to.equal(0);

            context.destroy();

            emitter.emit('event');

            expect(executedCount).to.equal(0);
        });

    });

    describe('unsubscribe', () => {

        it('should be able to unsubscribe', () => {
            const emitter = new EventEmitter();

            let executedCount = 0;
            const config = {
                emitter,
                execute: () => executedCount++
            };
            const files = [{
                content:
                    'const execute = resolve("execute");' +
                    'const handler = () => {' +
                    '   execute();' +
                    '   unsubscribe("emitter.event", handler);' +
                    '};' +
                    'subscribe("emitter.event", handler);'
            }];


            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executedCount).to.equal(0);

            emitter.emit('event');

            expect(executedCount).to.equal(1);

            emitter.emit('event');

            expect(executedCount).to.equal(1);
        });

    });

    describe('setTimeout', () => {

        it('should provide setTimeout', done => {
            let executed = false;
            const config = {
                exec: () => (executed = true)
            };
            const files = [{
                content: 'setTimeout(resolve("exec"), 0)'
            }];

            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executed).to.equal(false);

            setTimeout(() => {
                expect(executed).to.equal(true);
                done();
            }, 1);
        });

    });

    describe('clearTimeout', () => {

        it('should provide clearTimeout', done => {
            let executed = false;
            const config = {
                exec: () => (executed = true)
            };
            const files = [{
                content: 'const timeoutId = setTimeout(resolve("exec"), 0); clearTimeout(timeoutId);'
            }];

            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executed).to.equal(false);

            setTimeout(() => {
                expect(executed).to.equal(false);
                done();
            }, 1);
        });

    });

    describe('provide functions', () => {

        it('should be able to provide functions', () => {
            let executed = false;
            const config = {
                exec: () => (executed = true)
            };
            const files = [{
                content: 'const exec = resolve("exec"); provideFn("customExec", () => exec());',
            }, {
                content: 'const customExec = scriptResolve("customExec"); customExec();'
            }];

            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executed).to.equal(true);
        });

        it('should not be able to register same function twice', () => {
            const context = scriptContext({}, [
                { content: 'provideFn("name", () => {});' },
                { content: 'provideFn("name", () => {});' },
            ]);

            const { scriptResult } = context;
            const [ worked, failed ] = scriptResult;

            expect(worked.success).to.equal(true);
            expect(failed.success).to.equal(false);
        });

        it('should not be possibe to register other than functions', () => {
            const context = scriptContext({}, [
                { content: 'provideFn("name", 1);' },
                { content: 'provideFn("name", "text");' },
                { content: 'provideFn("name", /regExp/);' },
                { content: 'provideFn("", new Date())' }
            ]);

            const allError = context.scriptResult.every(script => script.error);
            expect(allError).to.equal(true);
        });

    });

    describe('provide / (un)subscribe script event', () => {

        it('should be able to provide events', () => {

            let executedCount = 0;
            const emitter = new EventEmitter();

            const config = {
                emitter,
                execute: () => executedCount++
            };
            const files = [{
                content: 'const execute = provideEvent("exec"); subscribe("emitter.event", execute);'
            }, {
                content:
                    'const exec = resolve("execute"); ' +
                    'const once = () => { exec(); scriptUnsubscribe("exec") }; ' +
                    'scriptSubscribe("exec", once);'
            }];


            const context = scriptContext(config, files);

            const { scriptResult } = context;
            scriptOk(scriptResult);

            expect(executedCount).to.equal(0);

            emitter.emit('event');

            expect(executedCount).to.equal(1);

            emitter.emit('event');

            expect(executedCount).to.equal(1);
        });

        it('should not be possibe to register an event twice', () => {
            const context = scriptContext({}, [
                { content: 'provideEvent("name");' },
                { content: 'provideEvent("name");' },
            ]);

            const { scriptResult } = context;
            const [ worked, failed ] = scriptResult;

            expect(worked.success).to.equal(true);
            expect(failed.success).to.equal(false);
        });

    });
});
