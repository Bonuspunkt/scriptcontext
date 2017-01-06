const expect = require('chai').expect;
const timeout = require('../../../lib/provider/timeout');


describe('timeout', () => {

    describe('setTimeout', () => {

        it('should provide setTimeout', done => {

            const provider = timeout({ timeout: true});
            const { provide } = provider;

            let executed = false;
            provide.setTimeout(() => { executed = true; }, 0);

            expect(executed).to.equal(false);

            setTimeout(() => {
                expect(executed).to.equal(true);
                done();
            }, 1);
        });

    });

    describe('clearTimeout', () => {

        it('should provide clearTimeout', done => {

            const provider = timeout({ timeout: true});
            const { provide } = provider;

            let executed = false;

            const timeoutId = provide.setTimeout(() => { executed = true; }, 0);
            clearTimeout(timeoutId);

            expect(executed).to.equal(false);

            setTimeout(() => {
                expect(executed).to.equal(false);
                done();
            }, 1);
        });

    });

});
