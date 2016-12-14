/* eslint quotes: 0 */
const { EventEmitter } = require('events');
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

    });

    describe('resolve', () => {

        it('should resolve functions', () => {
            const context = scriptContext({
                func: () => {},
            }, [{
                file: 'object.js',
                content: 'resolve("func")'
            }]);

            const scriptResult = context.scriptResult;
            expect(scriptResult.length).to.equal(1);
            const object = scriptResult[0];
            expect(object.success).to.equal(true);

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

            const scriptResult = context.scriptResult;
            expect(scriptResult.length).to.equal(1);
            const objectFunc = scriptResult[0];
            expect(objectFunc.success).to.equal(true);
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
            const object = scriptResult[0];
            expect(object.success).to.equal(false);
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
            expect(scriptResult.length).to.equal(1);

            const object = scriptResult[0];
            expect(object.success).to.equal(true);

            expect(executedCount).to.equal(0);

            emitter.emit('event');

            expect(executedCount).to.equal(1);
        });

        it('should not be able to handle events after destroy', () => {
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
            expect(scriptResult.length).to.equal(1);

            const object = scriptResult[0];
            expect(object.success).to.equal(true);

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
            expect(scriptResult.length).to.equal(1);

            const object = scriptResult[0];
            expect(object.success).to.equal(true);

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
            expect(scriptResult.length).to.equal(1);

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
                content: 'const timeoutId = setTimeout(resolve("exec"), 0); clearTimeout(timeoutId)'
            }];

            const context = scriptContext(config, files);

            const { scriptResult } = context;
            expect(scriptResult.length).to.equal(1);

            expect(executed).to.equal(false);

            setTimeout(() => {
                expect(executed).to.equal(false);
                done();
            }, 1);
        });
    });

});
