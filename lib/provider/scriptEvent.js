module.exports = (config) => {

    if (!config.scriptEvent) { return; }

    const scriptEvents = {};

    return {
        provide: {
            provideEvent: (eventName) => {
                if (scriptEvents[eventName]) {
                    throw Error(`${ eventName} is already registered`);
                }

                scriptEvents[eventName] = [];
                return (...args) => scriptEvents[eventName].forEach(fn => fn.apply(null, args));
            },

            scriptSubscribe: (eventName, fn) => {
                scriptEvents[eventName].push(fn);
            },
            scriptUnsubscribe: (eventName, fn) => {
                const subscribers = scriptEvents[eventName];
                const index = subscribers.indexOf(fn);
                subscribers.splice(index, 1);
            }
        }
    };

};
