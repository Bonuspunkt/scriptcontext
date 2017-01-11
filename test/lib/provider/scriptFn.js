const expect = require('chai').expect;
const scriptFnProvider = require('../../../lib/provider/scriptFn');

describe('provide functions', () => {

    it('should be able to provide functions', () => {
        let executed = false;
        const { provide } = scriptFnProvider({ scriptFn: true });
        const { provideFn, scriptResolve } = provide;

        provideFn('customExec', () => { executed = true; });
        const customExec = scriptResolve('customExec');

        expect(executed).to.equal(false);

        customExec();

        expect(executed).to.equal(true);
    });

    it('should not be able to register same function twice', () => {

        const { provide } = scriptFnProvider({ scriptFn: true });
        const { provideFn } = provide;

        expect(() => provideFn('name', () => {})).to.not.throw();
        expect(() => provideFn('name', () => {})).to.throw(Error);
    });

    it('should not be possibe to register other than functions', () => {

        const { provide } = scriptFnProvider({ scriptFn: true });
        const { provideFn } = provide;

        expect(() => provideFn('name', 1)).to.throw(Error);
        expect(() => provideFn('name', 'text')).to.throw(Error);
        expect(() => provideFn('name', /regExp/)).to.throw(Error);
        expect(() => provideFn('name', new Date())).to.throw(Error);
        expect(() => provideFn('name', {})).to.throw(Error);
        expect(() => provideFn('name', [])).to.throw(Error);
    });

});
