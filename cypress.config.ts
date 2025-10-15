import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false,
  },
  env: {
    // API Gateway
    apiGatewayUrl: 'http://localhost:5050',
    
    // Test user credentials
    adminEmail: 'admin@nexticket.com',
    adminPassword: 'admin123',
    
    organizerEmail: 'organizer@nexticket.com',
    organizerPassword: 'organizer123',
    
    venueOwnerEmail: 'venue@nexticket.com',
    venueOwnerPassword: 'venue123',
    
    eventAdminEmail: 'eventadmin@nexticket.com',
    eventAdminPassword: 'eventadmin123',
    
    checkinOfficerEmail: 'checkin@nexticket.com',
    checkinOfficerPassword: 'checkin123',
    
    customerEmail: 'customer@nexticket.com',
    customerPassword: 'customer123',
  },
});
