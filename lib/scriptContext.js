const vm = require('vm');

const providers = [
    require('./provider/resolve'),
    require('./provider/scriptEvent'),
    require('./provider/scriptFn'),
    require('./provider/subscribe'),
    require('./provider/timeout'),
];


function createContext(config, scripts) {
    const provided = providers
        .map(provider => provider(config))
        .filter(_ => _);

    const cleanContext = Object.create(null);
    Object.assign(cleanContext, ...provided.map(p => p.provide));

    const context = vm.createContext(cleanContext);

    const scriptResult = scripts.map(script => {
        try {
            vm.runInContext(
                `"use strict";\r\n(function(){ ${ script.content } }());`,
                context
            );
            return {
                success: true,
                file: script.file,
            };
        } catch (e) {
            return {
                success: false,
                file: script.file,
                error: e
            };
        }
    });

    return {
        scriptResult,
        destroy: () => provided.filter(p => p.destroy).forEach(p => p.destroy())
    };
}

module.exports = createContext;
