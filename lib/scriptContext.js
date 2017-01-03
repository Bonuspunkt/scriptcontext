const vm = require('vm');

function createContext(config, scripts) {
    const handlers = {};
    const subscriptions = {};
    const timeouts = [];

    const dirtyContext = {
        resolve: alias => {
            const split = alias.split(/\./g);

            const result = split.reduce((result, key) => result[key], config);
            if (typeof result !== 'function') {
                throw Error('resolve did not end in a function');
            }
            return (...args) => result.apply(null, args);
        },

        subscribe: (alias, fn) => {
            if (subscriptions[alias]) {
                subscriptions[alias].push(fn);
                return;
            }

            const split = alias.split(/\./g);
            const eventName = split.pop();

            handlers[alias] = (...args) => subscriptions[alias].forEach(f => f(...args));
            subscriptions[alias] = [fn];

            const emitter = split.reduce((result, key) => result[key], config);
            emitter.on(eventName, handlers[alias]);
        },
        unsubscribe: (alias, fn) => {
            if (subscriptions[alias]) {
                const index = subscriptions[alias].indexOf(fn);
                subscriptions[alias].splice(index, 1);
                return;
            }
        },

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
    };

    if (true /*scripts.canProvide?*/) {
        const scriptEvents = {};
        const scriptFn = {};

        const provide = {
            provideFn: (alias, fn) => {
                if (scriptFn[alias]) {
                    throw Error(`${ alias } is already registered`);
                }
                if (typeof fn !== 'function') {
                    throw Error('supplied value must be function');
                }

                scriptFn[alias] = fn;
            },
            scriptResolve: alias => {
                return scriptFn[alias];
            },

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
        };

        Object.keys(provide).forEach(key => { dirtyContext[key] = provide[key]; });
    }

    const cleanContext = Object.create(null);
    Object.keys(dirtyContext).forEach(key => (cleanContext[key] = dirtyContext[key]));

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
        destroy: () => {
            Object.keys(handlers).forEach(key => {
                const split = key.split(/\./g);
                const eventName = split.pop();
                const emitter = split.reduce((result, key) => result[key], config);
                emitter.removeListener(eventName, handlers[key]);
            });

            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        }
    };
}

module.exports = createContext;
