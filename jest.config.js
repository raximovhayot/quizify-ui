import nextJest from 'next/jest.js';
import { VirtualConsole } from 'jsdom';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: '<rootDir>/jest.custom-environment.js',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^mathlive$': '<rootDir>/src/__mocks__/mathlive.js',
    '^katex$': '<rootDir>/src/__mocks__/katex.js',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'middleware.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    // Critical auth helpers (initial baseline)
    './src/lib/auth/**/*.{ts,tsx}': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Atomic components baseline
    './src/components/atomic/**/*.{ts,tsx}': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Middleware (current coverage ~58% lines, ~33% functions)
    './middleware.ts': {
      branches: 50,
      functions: 30,
      lines: 50,
      statements: 50,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
