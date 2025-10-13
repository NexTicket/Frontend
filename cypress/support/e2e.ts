// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Add global configurations
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // This is useful for Next.js hydration warnings and React errors
  console.log('Uncaught exception:', err.message);
  return false;
});

// Add custom before/after hooks
beforeEach(() => {
  // Clear cookies and local storage before each test
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

afterEach(() => {
  // Log test completion
  cy.log('Test completed');
});