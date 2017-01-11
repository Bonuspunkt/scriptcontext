const { EventEmitter } = require('events');
const expect = require('chai').expect;
const subscribeProvider = require('../../../lib/provider/subscribe');

describe('subscribe', () => {

    it('should be able to subscribe to eventemitter', () => {
        let executedCount = 0;
        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe } = provide;

        subscribe('emitter.event', () => executedCount++);

        emitter.emit('event');

        expect(executedCount).to.equal(1);
    });

    it('should be able to handle multiple subscriptions', () => {
        let executedCount1 = 0;
        let executedCount2 = 0;
        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe, unsubscribe } = provide;

        const incExecutedCount1 = () => executedCount1++;
        subscribe('emitter.event', incExecutedCount1);

        expect(executedCount1).to.equal(0);

        emitter.emit('event');

        expect(executedCount1).to.equal(1);
        expect(executedCount2).to.equal(0);

        const incExecutedCount2 = () => executedCount2++;
        subscribe('emitter.event', incExecutedCount2);

        emitter.emit('event');

        expect(executedCount1).to.equal(2);
        expect(executedCount2).to.equal(1);

        unsubscribe('emitter.event', incExecutedCount1);

        emitter.emit('event');

        expect(executedCount1).to.equal(2);
        expect(executedCount2).to.equal(2);
    });

    it('should not handle events after destroy', () => {

        let executedCount = 0;
        const emitter = new EventEmitter();

        const { provide, destroy } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe } = provide;

        subscribe('emitter.event', () => executedCount++);

        expect(executedCount).to.equal(0);

        destroy();

        emitter.emit('event');

        expect(executedCount).to.equal(0);
    });

    it('should crash', () => {

        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({ subscribe: { emitter } });
        const { subscribe } = provide;
        subscribe('emitter.event', () => { throw Error(); });

        expect(() => emitter.emit('event')).to.throw(Error);
    });

    it('should not crash', () => {

        let error;
        const emitter = new EventEmitter();

        const { provide } = subscribeProvider({
            subscribe: { emitter },
            onError: (e) => { error = e; }
        });
        const { subscribe } = provide;
        subscribe('emitter.event', () => { throw Error(); });

        expect(() => emitter.emit('event')).to.not.throw(Error);
        expect(error).to.be.instanceof(Error);
    });

});
