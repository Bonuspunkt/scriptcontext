module.exports = (config) => {

    if (!config.timeout) { return; }

    const timeouts = [];

    return {
        provide: {

            setTimeout: (fn, timeout, ...args) => {
                const timeoutId = setTimeout(fn, timeout, ...args);
                timeouts.push(timeoutId);
                setTimeout(() => timeouts.splice(timeouts.indexOf(timeoutId), 1));
                return timeoutId;
            },

            clearTimeout: (timeoutId, ...args) => {
                clearTimeout(timeoutId, ...args);
                timeouts.splice(timeouts.indexOf(timeoutId), 1);
            }

        },

        destroy: () => {
            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        }
    };

};
