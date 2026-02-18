import { defineConfig } from 'vitest/config';
import tsconfigPath from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPath()],
  test: {
    clearMocks: true,
    exclude: [
      '*.config.*',
      '*eslint*',
      'eslint-subconfigs/**/*',
      'node_modules/**/*',
      '**/demo/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov', 'html', 'text', 'clover', 'cobertura'],
      exclude: [
        'eslint-subconfigs/**',
        '**/eslint-subconfigs/**',
        'dist/**',
        '*.config.*',
        '*eslint*',
        'node_modules/**',
        '**/demo/**',
      ],
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: [
          '--cpu-prof',
          '--cpu-prof-dir=test-runner-profile',
          '--heap-prof',
          '--heap-prof-dir=test-runner-profile',
        ],

        // To generate a single profile
        singleFork: true,
      },
    },
    globals: true,
    environment: 'node',
  },
});
