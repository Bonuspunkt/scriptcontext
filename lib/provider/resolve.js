module.exports = (config) => {
    const { resolve } = config;

    if (!resolve) { return; }

    return {
        provide: {
            resolve: alias => {
                const split = alias.split(/\./g);

                const result = split.reduce((result, key) => result[key], resolve);

                if (typeof result !== 'function') {
                    throw Error('resolve did not end in a function');
                }
                return (...args) => result.apply(null, args);
            }
        }
    };
};
