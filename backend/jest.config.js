
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          target: 'ES2021',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
        },
      },
    ],
  },
};

