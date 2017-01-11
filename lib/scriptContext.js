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
                `"use strict";\r\n(function(){\r\n${ script.content }\r\n}());`,
                context,
                { filename: script.file, lineOffset: -2 }
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

    const access = Object.assign({}, ...provided.map(p => p.access));

    return {
        scriptResult,
        access,
        destroy: () => provided.filter(p => p.destroy).forEach(p => p.destroy())
    };
}

module.exports = createContext;
