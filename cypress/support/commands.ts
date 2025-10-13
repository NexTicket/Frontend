/// <reference types="cypress" />

// ***********************************************
// Custom Commands for NexTicket Testing
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('admin@nexticket.com', 'admin123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to login as a specific role
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;
      loginAsOrganizer(): Chainable<void>;
      loginAsCustomer(): Chainable<void>;
      loginAsVenueOwner(): Chainable<void>;
      loginAsEventAdmin(): Chainable<void>;
      loginAsCheckinOfficer(): Chainable<void>;
      
      /**
       * Custom command to logout
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to wait for Firebase auth and page load
       */
      waitForAuth(): Chainable<void>;
      
      /**
       * Custom command to wait for page to fully load
       */
      waitForPageLoad(): Chainable<void>;
    }
  }
}

// =============================================================================
// LOGIN COMMANDS
// =============================================================================

/**
 * Login with email and password
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.log(`🔐 Logging in as: ${email}`);
  
  cy.visit('/auth/signin');
  
  // Wait for page to load
  cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible');
  
  // Fill in credentials
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  
  // Submit form
  cy.get('button[type="submit"]').click();
  
  // Wait for authentication to complete
  cy.waitForAuth();
});

/**
 * Login as Admin
 */
Cypress.Commands.add('loginAsAdmin', () => {
  const email = Cypress.env('adminEmail');
  const password = Cypress.env('adminPassword');
  cy.login(email, password);
  cy.url().should('include', '/admin/dashboard', { timeout: 15000 });
});

/**
 * Login as Organizer
 */
Cypress.Commands.add('loginAsOrganizer', () => {
  const email = Cypress.env('organizerEmail');
  const password = Cypress.env('organizerPassword');
  cy.login(email, password);
  cy.url().should('include', '/organizer/dashboard', { timeout: 15000 });
});

/**
 * Login as Customer
 */
Cypress.Commands.add('loginAsCustomer', () => {
  const email = Cypress.env('customerEmail');
  const password = Cypress.env('customerPassword');
  cy.login(email, password);
  cy.url().should('include', '/events', { timeout: 15000 });
});

/**
 * Login as Venue Owner
 */
Cypress.Commands.add('loginAsVenueOwner', () => {
  const email = Cypress.env('venueOwnerEmail');
  const password = Cypress.env('venueOwnerPassword');
  cy.login(email, password);
  cy.url().should('include', '/venue-owner/dashboard', { timeout: 15000 });
});

/**
 * Login as Event Admin
 */
Cypress.Commands.add('loginAsEventAdmin', () => {
  const email = Cypress.env('eventAdminEmail');
  const password = Cypress.env('eventAdminPassword');
  cy.login(email, password);
  cy.url().should('include', '/event-admin', { timeout: 15000 });
});

/**
 * Login as Checkin Officer
 */
Cypress.Commands.add('loginAsCheckinOfficer', () => {
  const email = Cypress.env('checkinOfficerEmail');
  const password = Cypress.env('checkinOfficerPassword');
  cy.login(email, password);
  cy.url().should('include', '/checkin-officer', { timeout: 15000 });
});

// =============================================================================
// LOGOUT COMMAND
// =============================================================================

/**
 * Logout from the application
 */
Cypress.Commands.add('logout', () => {
  cy.log('🚪 Logging out');
  
  // Try to find and click logout button
  // Adjust selector based on your actual logout button
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="user-menu"]').length > 0) {
      cy.get('[data-testid="user-menu"]').click();
      cy.contains('Sign Out').click();
    } else if ($body.find('button:contains("Sign Out")').length > 0) {
      cy.contains('Sign Out').click();
    } else if ($body.find('a:contains("Sign Out")').length > 0) {
      cy.contains('Sign Out').click();
    }
  });
  
  // Verify logout
  cy.url().should('not.include', '/dashboard');
});

// =============================================================================
// UTILITY COMMANDS
// =============================================================================

/**
 * Wait for Firebase authentication to complete
 */
Cypress.Commands.add('waitForAuth', () => {
  cy.log('⏳ Waiting for authentication...');
  
  // Wait for redirect from signin page
  cy.url().should('not.include', '/auth/signin', { timeout: 15000 });
  
  // Wait for any loading indicators to disappear
  cy.wait(2000); // Give time for Firebase to complete
  
  // Wait for page to be fully loaded
  cy.waitForPageLoad();
});

/**
 * Wait for page to fully load
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.log('⏳ Waiting for page to load...');
  
  // Wait for React to hydrate
  cy.wait(1000);
  
  // Wait for any loading spinners to disappear
  cy.get('body').should('be.visible');
});

export {};