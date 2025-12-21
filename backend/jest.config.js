module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.js'],
  testTimeout: 60000, // Selenium testleri için 60 saniye timeout
  verbose: true,
  collectCoverage: false,
  // Selenium testleri için async işlemler için
  maxWorkers: 1, // Selenium testleri paralel çalışmamalı
};

