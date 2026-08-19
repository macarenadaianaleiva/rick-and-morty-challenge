const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // test-utils.tsx is a shared helper, not a test file itself.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/test-utils.tsx'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/layout.tsx', '!src/**/*.d.ts'],
};

module.exports = createJestConfig(customJestConfig);
