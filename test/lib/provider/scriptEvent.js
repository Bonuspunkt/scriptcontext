const expect = require('chai').expect;
const scriptEventProvider = require('../../../lib/provider/scriptEvent');

describe('scriptEvent', () => {

    it('should be able to provide events', () => {

        let executedCount = 0;
        const { provide } = scriptEventProvider({ scriptEvent: true });
        const { provideEvent, scriptSubscribe, scriptUnsubscribe } = provide;


        const fireExec = provideEvent('exec');
        const handleExec = () => {
            executedCount++;
            scriptUnsubscribe('exec', handleExec);
        };
        scriptSubscribe('exec', handleExec);

        expect(executedCount).to.equal(0);

        fireExec();

        expect(executedCount).to.equal(1);

        fireExec();

        expect(executedCount).to.equal(1);
    });

    it('should not be possibe to register an event twice', () => {

        const { provide } = scriptEventProvider({ scriptEvent: true });
        const { provideEvent } = provide;

        expect(() => provideEvent('name')).to.not.throw();
        expect(() => provideEvent('name')).to.throw();
    });

});
