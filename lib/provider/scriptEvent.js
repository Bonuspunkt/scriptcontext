module.exports = (config) => {

    if (!config.scriptEvent) { return; }

    const scriptEventNames = [];
    const scriptEvents = {};

    const scriptSubscribe = (eventName, fn) => {
        scriptEvents[eventName] = scriptEvents[eventName] || [];
        scriptEvents[eventName].push(fn);
    };
    const scriptUnsubscribe = (eventName, fn) => {
        const subscribers = scriptEvents[eventName];
        const index = subscribers.indexOf(fn);
        subscribers.splice(index, 1);
    };

    return {
        provide: {
            provideEvent: (eventName) => {
                if (scriptEventNames.includes(eventName)) {
                    throw Error(`${ eventName} is already registered`);
                }

                scriptEventNames.push(eventName);
                scriptEvents[eventName] = scriptEvents[eventName] || [];
                return (...args) => scriptEvents[eventName].forEach(fn => fn.apply(null, args));
            },

            scriptSubscribe,
            scriptUnsubscribe
        },
        access: {
            scriptSubscribe,
            scriptUnsubscribe
        }
    };

};
