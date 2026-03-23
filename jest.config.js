module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/coverage/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/jest.setup.ts"],
  testTimeout: 30000,
};
