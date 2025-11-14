/// <reference types="cypress" />

/**
 * Custom command to stub file upload
 */
Cypress.Commands.add('stubFileUpload', (selector: string, fileName: string, mimeType: string, fileSize?: number) => {
  const size = fileSize || 1024; // Default 1KB
  const file = new File([new ArrayBuffer(size)], fileName, { type: mimeType });

  cy.get(selector).then((input) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    (input[0] as HTMLInputElement).files = dataTransfer.files;
    input[0].dispatchEvent(new Event('change', { bubbles: true }));
  });
});

export {};
// ***********************************************************
// This support file is processed and loaded automatically before your test files.
//
// You can add global configurations and custom commands here.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to stub file upload
       * @example cy.stubFileUpload('input[type="file"]', 'test.mp3', 'audio/mp3')
       */
      stubFileUpload(selector: string, fileName: string, mimeType: string, fileSize?: number): Chainable<void>;
    }
  }
}

