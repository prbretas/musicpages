import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        // Worker startup can be slow on some machines (notably Windows + jsdom).
        // Give workers more time to spin up to avoid false-negative "worker timeout" errors.
        testTimeout: 20000,
        hookTimeout: 20000,
        // Run all test files in a single reused fork. This avoids the repeated, expensive
        // jsdom environment setup that otherwise causes "worker startup timeout" errors
        // on slower machines (observed on Windows). See vitest poolOptions.forks.singleFork.
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
    },
});
