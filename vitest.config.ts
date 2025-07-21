/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom environment for React component testing and DOM simulation
    environment: 'jsdom',

    // Global test setup file
    setupFiles: ['./src/setupTests.ts'],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      // Coverage thresholds for game logic (as specified in PRD)
      thresholds: {
        global: {
          branches: 75,
          functions: 90,
          lines: 80,
          statements: 80,
        },
        // Higher thresholds for critical ECS modules
        'src/game/': {
          branches: 80,
          functions: 95,
          lines: 85,
          statements: 85,
        },
      },
    },

    // Test execution configuration optimized for ECS
    testTimeout: 10000, // 10 seconds for complex ECS operations
    hookTimeout: 10000, // 10 seconds for setup/teardown

    // Parallel execution for performance
    pool: 'threads',
    poolOptions: {
      threads: {
        // Use available threads, Vitest will auto-detect optimal number
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Test file patterns - only include src directory
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      '.idea/**',
      '.git/**',
      '.cache/**',
      '**/*.d.ts',
      '**/*.config.*',
    ],

    // Watch mode configuration
    watch: true,

    // Reporter configuration
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results.xml',
    },

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,

    // Snapshot configuration
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace(/\.test\.([tj]sx?)/, `${snapExtension}.$1`);
    },
  },
});
