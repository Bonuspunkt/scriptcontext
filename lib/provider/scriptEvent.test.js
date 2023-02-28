const { describe, expect, test } = require('@jest/globals');
const scriptEventProvider = require('./scriptEvent');

describe('scriptEvent', () => {

    test('should be able to provide events', () => {

        let executedCount = 0;
        const { provide } = scriptEventProvider({ scriptEvent: true });
        const { provideEvent, scriptSubscribe, scriptUnsubscribe } = provide;


        const fireExec = provideEvent('exec');
        const handleExec = () => {
            executedCount++;
            scriptUnsubscribe('exec', handleExec);
        };
        scriptSubscribe('exec', handleExec);

        expect(executedCount).toBe(0);

        fireExec();

        expect(executedCount).toBe(1);

        fireExec();

        expect(executedCount).toBe(1);
    });

    test('should not be possibe to register an event twice', () => {

        const { provide } = scriptEventProvider({ scriptEvent: true });
        const { provideEvent } = provide;

        expect(() => provideEvent('name')).not.toThrow();
        expect(() => provideEvent('name')).toThrow();
    });

});
