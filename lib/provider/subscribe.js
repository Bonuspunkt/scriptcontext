module.exports = config => {

    const { subscribe, onError } = config;
    if (!subscribe) { return; }

    const handlers = {};
    const subscriptions = {};

    return {
        provide: {
            subscribe: (alias, fn) => {
                if (subscriptions[alias]) {
                    subscriptions[alias].push(fn);
                    return;
                }

                const split = alias.split(/\./g);
                const eventName = split.pop();

                handlers[alias] = (...args) => {
                    try {
                        subscriptions[alias].forEach(f => f(...args));
                    } catch (e) {
                        if (!onError) throw e;
                        onError(e);
                    }
                };
                subscriptions[alias] = [fn];

                const emitter = split.reduce((result, key) => result[key], subscribe);
                emitter.on(eventName, handlers[alias]);
            },

            unsubscribe: (alias, fn) => {
                if (!subscriptions[alias]) { return; }
                const index = subscriptions[alias].indexOf(fn);
                subscriptions[alias].splice(index, 1);
            }
        },

        destroy: () => {
            Object.keys(handlers).forEach(key => {
                const split = key.split(/\./g);
                const eventName = split.pop();
                const emitter = split.reduce((result, key) => result[key], subscribe);
                emitter.removeListener(eventName, handlers[key]);
            });
        }
    };
};
