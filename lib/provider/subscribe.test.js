const { describe, expect, test } = require('@jest/globals');
const { EventEmitter } = require('events');
const subscribeProvider = require('./subscribe');

describe('subscribe', () => {

    test('should be able to subscribe to eventemitter', () => {
        let executedCount = 0;
        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe } = provide;

        subscribe('emitter.event', () => executedCount++);

        emitter.emit('event');

        expect(executedCount).toBe(1);
    });

    test('should be able to handle multiple subscriptions', () => {
        let executedCount1 = 0;
        let executedCount2 = 0;
        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe, unsubscribe } = provide;

        const incExecutedCount1 = () => executedCount1++;
        subscribe('emitter.event', incExecutedCount1);

        expect(executedCount1).toBe(0);

        emitter.emit('event');

        expect(executedCount1).toBe(1);
        expect(executedCount2).toBe(0);

        const incExecutedCount2 = () => executedCount2++;
        subscribe('emitter.event', incExecutedCount2);

        emitter.emit('event');

        expect(executedCount1).toBe(2);
        expect(executedCount2).toBe(1);

        unsubscribe('emitter.event', incExecutedCount1);

        emitter.emit('event');

        expect(executedCount1).toBe(2);
        expect(executedCount2).toBe(2);
    });

    test('should not handle events after destroy', () => {

        let executedCount = 0;
        const emitter = new EventEmitter();

        const { provide, destroy } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe } = provide;

        subscribe('emitter.event', () => executedCount++);

        expect(executedCount).toBe(0);

        destroy();

        emitter.emit('event');

        expect(executedCount).toBe(0);
    });

    test('should crash', () => {

        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe } = provide;
        subscribe('emitter.event', () => { throw Error(); });

        expect(() => emitter.emit('event')).toThrow(Error);
    });

    test('should not crash', () => {

        let error;
        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({
            subscribe: { emitter },
            onError: (e) => { error = e; }
        });
        const { subscribe } = provide;
        subscribe('emitter.event', () => { throw Error(); });

        expect(() => emitter.emit('event')).not.toThrow(Error);
        expect(error).toBeInstanceOf(Error);
    });

});
