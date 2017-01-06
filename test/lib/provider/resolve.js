const expect = require('chai').expect;
const resolveProvider = require('../../../lib/provider/resolve');

describe('resolve', () => {

    it('should resolve functions', () => {
        let executed = false;
        const func = () => { executed = true; };
        const { provide } = resolveProvider({
            resolve: { func }
        });

        const fn = provide.resolve('func');

        expect(executed).to.equal(false);

        fn();

        expect(executed).to.equal(true);
    });

    it('should resolve nested functions', () => {
        let executed = false;
        const func = () => { executed = true; };
        const { provide } = resolveProvider({
            resolve: { object: { func: func } }
        });

        const fn = provide.resolve('object.func');

        expect(executed).to.equal(false);

        fn();

        expect(executed).to.equal(true);

    });

    it('should not resolve non functions', () => {
        const { provide } = resolveProvider({
            resolve: { object: {} }
        });

        expect(() => provide.resolve('object')).to.throw(Error);
    });

});
