/// <reference types="cypress" />

describe('Authentication - Sign In', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/auth/signin');
  });

  // =============================================================================
  // BASIC UI TESTS
  // =============================================================================
  
  describe('Sign In Page UI', () => {
    it('should display the sign in form', () => {
      cy.contains('Sign In').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Remember me').should('be.visible');
    });

    it('should have a link to sign up page', () => {
      cy.contains('Create one now').should('be.visible');
      cy.contains('Create one now').click();
      cy.url().should('include', '/auth/signup');
    });

    it('should have Google sign in option', () => {
      cy.contains('Sign in with Google').should('be.visible');
      cy.contains('Or continue with').should('be.visible');
    });
  });

  // =============================================================================
  // FORM VALIDATION TESTS
  // =============================================================================
  
  describe('Form Validation', () => {
    it('should require email field', () => {
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Check HTML5 validation
      cy.get('input[name="email"]').then(($input) => {
        const input = $input[0] as HTMLInputElement;
        expect(input.validity.valid).to.be.false;
      });
    });

    it('should require password field', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();
      
      // Check HTML5 validation
      cy.get('input[name="password"]').then(($input) => {
        const input = $input[0] as HTMLInputElement;
        expect(input.validity.valid).to.be.false;
      });
    });

    it('should have proper input types for accessibility', () => {
      // Check that inputs have correct types for screen readers
      cy.get('input[name="email"]').should('have.attr', 'type', 'email');
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });
  });
});
