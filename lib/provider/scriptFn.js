module.exports = config => {

    if (!config.scriptFn) { return; }

    const scriptFn = {};
    const scriptResolve = alias => (...args) => scriptFn[alias](...args);

    return {
        provide: {
            provideFn: (alias, fn) => {
                if (scriptFn[alias]) {
                    throw Error(`${ alias } is already registered`);
                }
                if (typeof fn !== 'function') {
                    throw Error('supplied value must be function');
                }

                scriptFn[alias] = fn;
            },

            scriptResolve
        },

        access: {
            scriptResolve
        }
    };

};
