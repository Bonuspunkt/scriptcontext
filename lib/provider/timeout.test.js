const { describe, expect, test } = require('@jest/globals');
const timeout = require('./timeout');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('timeout', () => {

    describe('setTimeout', () => {

        test('should provide setTimeout', async () => {

            const provider = timeout({ timeout: true });
            const { provide } = provider;

            let executed = false;
            provide.setTimeout(() => { executed = true; }, 0);

            expect(executed).toBe(false);

            await delay(1);
            expect(executed).toBe(true);
        });

    });

    describe('clearTimeout', () => {

        test('should provide clearTimeout', async () => {

            const provider = timeout({ timeout: true });
            const { provide } = provider;

            let executed = false;

            const timeoutId = provide.setTimeout(() => { executed = true; }, 0);
            provide.clearTimeout(timeoutId);

            expect(executed).toBe(false);

            await delay(1);
            expect(executed).toBe(false);
        });

    });

});
