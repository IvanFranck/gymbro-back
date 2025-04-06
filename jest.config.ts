export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts', // Inclure tous les fichiers TypeScript dans
    '!main.ts', // Exclure le fichier principal
    '!**/*.module.ts', // Exclure les modules NestJS
    '!**/*.dto.ts', // Exclure les fichiers dto
    '!**/*.entity.ts', // Exclure les fichiers entity
    '!**/*.guard.ts', // Exclure les fichiers guard
    '!constants/*.ts', // Exclure les constantes et les types personnels
    '!../test/**/**', // Exclure les fichiers de test d'integration et e2e
  ],
  // coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
