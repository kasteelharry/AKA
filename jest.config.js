/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleNameMapper: {
    '^@dir/(.*)$': '<rootDir>/src/$1'
  },
};