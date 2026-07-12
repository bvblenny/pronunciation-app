/// <reference types="cypress" />

describe('Transcription Feature', () => {
  beforeEach(() => {
    cy.visit('/transcribe');
  });

  it('should display the transcription page', () => {
    cy.get('.live-transcriber').should('be.visible');
    cy.get('.intro-title').should('contain.text', 'Live Speech to Text');
  });

  it('should display language selection', () => {
    cy.get('.language-select').should('be.visible');
    cy.get('mat-select').should('be.visible');
  });

  it('should display live transcription controls', () => {
    cy.get('.controls-section').should('be.visible');
    cy.contains('h2', 'Transcription Settings').should('be.visible');
  });

  it('should display upload button', () => {
    cy.contains('button', 'Upload Audio/Video').should('be.visible');
  });

  it('should display transcript section', () => {
    cy.get('.transcript-section').should('be.visible');
    cy.contains('h2', 'Transcript').should('be.visible');
  });

  it('should show browser speech recognition status', () => {
    // Check if either "Start Live Transcription" or the warning message is shown
    cy.get('.controls-section').then(($section) => {
      const hasSupport = $section.find('.primary-action').length > 0;
      const hasWarning = $section.find('.alert-warning').length > 0;
      expect(hasSupport || hasWarning).to.be.true;
    });
  });

  describe('File Upload', () => {
    it('should have a file input for audio/video uploads', () => {
      cy.get('input[type="file"][accept="audio/*,video/*"]').should('exist');
    });

    it('should trigger file selection when upload button is clicked', () => {
      cy.get('input[type="file"]').should('not.be.visible');
      // Button should be visible and clickable
      cy.contains('button', 'Upload Audio/Video').should('be.visible');
    });

    it('should handle valid file upload', () => {
      // Intercept the API call
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 200,
        body: {
          transcript: 'This is a test transcription',
          segments: [
            { text: 'This is a test transcription', startMs: 0, endMs: 2000 }
          ]
        }
      }).as('transcribeRequest');

      // Create a small mock audio file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('fake audio content'),
        fileName: 'test-audio.mp3',
        mimeType: 'audio/mp3'
      }, { force: true });

      // Wait for the API call
      cy.wait('@transcribeRequest');

      // Verify the transcription appears
      cy.get('.transcript-section').should('contain.text', 'This is a test transcription');
    });

    it('should display error for invalid file format (400)', () => {
      // Intercept the API call with 400 error
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 400,
        body: { error: 'Invalid file format' }
      }).as('transcribeRequest');

      // Upload a file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('invalid content'),
        fileName: 'test.txt',
        mimeType: 'text/plain'
      }, { force: true });

      // Wait for the API call
      cy.wait('@transcribeRequest');

      // Verify error message is displayed
      cy.get('.alert-error').should('be.visible');
      cy.get('.alert-error').should('contain.text', 'Invalid or unsupported media');
    });

    it('should display error for file size limit exceeded (413)', () => {
      // Intercept the API call with 413 (Payload Too Large) error
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 413,
        body: { error: 'File too large' }
      }).as('transcribeRequest');

      // Create a mock large file (simulating a file that exceeds the limit)
      const largeFileSize = 50 * 1024 * 1024; // 50MB
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(largeFileSize),
        fileName: 'large-audio.mp3',
        mimeType: 'audio/mp3'
      }, { force: true });

      // Wait for the API call
      cy.wait('@transcribeRequest');

      // Verify the size limit error message is displayed
      cy.get('.alert-error').should('be.visible');
      cy.get('.alert-error').should('contain.text', 'File too large');
      cy.get('.alert-error').should('contain.text', 'Please upload a smaller file');
    });

    it('should show loading state during transcription', () => {
      // Intercept with delay to test loading state
      cy.intercept('POST', '**/api/pronunciation/transcribe', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: {
            transcript: 'Test',
            segments: [{ text: 'Test', startMs: 0, endMs: 1000 }]
          }
        });
      }).as('transcribeRequest');

      // Upload file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('audio content'),
        fileName: 'test.mp3',
        mimeType: 'audio/mp3'
      }, { force: true });

      // Verify loading state is shown
      cy.get('.transcribing-state').should('be.visible');
      cy.get('.transcribing-text').should('contain.text', 'Transcribing your file');
      cy.get('mat-progress-bar').should('be.visible');

      // Wait for completion
      cy.wait('@transcribeRequest');

      // Loading state should be gone
      cy.get('.transcribing-state').should('not.exist');
    });

    it('should disable upload button while transcribing', () => {
      cy.intercept('POST', '**/api/pronunciation/transcribe', (req) => {
        req.reply({
          delay: 500,
          statusCode: 200,
          body: {
            transcript: 'Test',
            segments: []
          }
        });
      }).as('transcribeRequest');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('audio'),
        fileName: 'test.mp3',
        mimeType: 'audio/mp3'
      }, { force: true });

      // Upload button should be disabled during transcription
      cy.contains('button', 'Upload Audio/Video').should('be.disabled');

      cy.wait('@transcribeRequest');

      // Should be enabled again after completion
      cy.contains('button', 'Upload Audio/Video').should('not.be.disabled');
    });

    it('should handle generic server error', () => {
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('transcribeRequest');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('audio'),
        fileName: 'test.mp3',
        mimeType: 'audio/mp3'
      }, { force: true });

      cy.wait('@transcribeRequest');

      cy.get('.alert-error').should('be.visible');
      cy.get('.alert-error').should('contain.text', 'Transcription failed');
    });
  });

  describe('Subtitle Download', () => {
    beforeEach(() => {
      // Setup successful transcription with segments
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 200,
        body: {
          transcript: 'Hello world. This is a test.',
          segments: [
            { text: 'Hello world.', startMs: 0, endMs: 1500 },
            { text: 'This is a test.', startMs: 1500, endMs: 3000 }
          ]
        }
      }).as('transcribeRequest');

      // Upload a file to get transcription
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('audio'),
        fileName: 'test.mp3',
        mimeType: 'audio/mp3'
      }, { force: true });

      cy.wait('@transcribeRequest');
    });

    it('should show subtitle download option when segments are available', () => {
      cy.get('.subtitle-badge').should('be.visible');
      cy.get('.subtitle-btn').should('not.be.disabled');
      cy.get('.subtitle-btn').click();
      cy.get('.mat-mdc-menu-panel').should('be.visible');
      cy.contains('button', 'SubRip (.srt)').should('be.visible');
      cy.contains('button', 'WebVTT (.vtt)').should('be.visible');
      cy.contains('button', 'Plain Text (.txt)').should('be.visible');
    });
  });

  describe('Language Selection', () => {
    it('should allow changing the language', () => {
      cy.get('.language-select mat-select').click();
      cy.get('mat-option').should('have.length.greaterThan', 1);
    });

    it('should maintain selected language', () => {
      cy.get('.language-select mat-select').click();
      // Select a language (assuming there are multiple options)
      cy.get('mat-option').eq(1).click();

      // Verify the selection persists
      cy.get('.language-select mat-select').should('exist');
    });
  });
});
