/// <reference types="cypress" />

describe('File Upload Size Limit Validation', () => {
  beforeEach(() => {
    cy.visit('/transcribe');
  });

  describe('Upload Size Limit - 413 Error', () => {
    it('should reject files exceeding the maximum size limit', () => {
      // Intercept API call and simulate 413 error (Payload Too Large)
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 413,
        body: {
          error: 'File size exceeds maximum allowed size',
          maxSize: '10MB'
        }
      }).as('uploadLargeFile');

      // Simulate uploading a large file (50MB)
      const largeFileSize = 50 * 1024 * 1024;
      cy.get('input[type="file"][accept="audio/*,video/*"]').selectFile({
        contents: Cypress.Buffer.alloc(largeFileSize),
        fileName: 'large-audio-file.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      // Wait for the request to complete
      cy.wait('@uploadLargeFile');

      // Verify the specific error message for file size
      cy.get('.alert-error', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'File too large')
        .and('contain.text', 'Please upload a smaller file');

      // Verify error icon is displayed
      cy.get('.alert-error mat-icon').should('contain.text', 'error_outline');

      // Verify transcription state is reset
      cy.get('.transcribing-state').should('not.exist');
      cy.get('.transcribing-text').should('not.exist');
    });

    it('should clear previous errors when uploading a new file after size limit error', () => {
      // First upload - exceeds size limit
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 413,
        body: { error: 'File too large' }
      }).as('firstUpload');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(50 * 1024 * 1024),
        fileName: 'large.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@firstUpload');
      cy.get('.alert-error').should('be.visible');

      // Second upload - valid size
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 200,
        body: {
          transcript: 'Success',
          segments: [{ text: 'Success', startMs: 0, endMs: 1000 }]
        }
      }).as('secondUpload');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('small audio content'),
        fileName: 'small.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@secondUpload');

      // Error should be cleared
      cy.get('.alert-error').should('not.exist');
      cy.get('.transcript-section').should('contain.text', 'Success');
    });

    it('should display correct error message for 413 vs other errors', () => {
      // Test 413 error
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 413
      }).as('sizeError');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(1024),
        fileName: 'test1.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@sizeError');
      cy.get('.alert-error').should('contain.text', 'File too large');

      // Test 400 error (different message)
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 400
      }).as('formatError');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test'),
        fileName: 'test2.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@formatError');
      cy.get('.alert-error').should('contain.text', 'Invalid or unsupported media');
      cy.get('.alert-error').should('not.contain.text', 'File too large');
    });
  });

  describe('Valid File Uploads', () => {
    it('should successfully upload small audio file', () => {
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 200,
        body: {
          transcript: 'This is a valid transcription',
          segments: [
            { text: 'This is a valid transcription', startMs: 0, endMs: 2500 }
          ]
        }
      }).as('uploadSmallFile');

      // Small file (1KB)
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(1024),
        fileName: 'small-audio.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@uploadSmallFile');

      // No error should be displayed
      cy.get('.alert-error').should('not.exist');

      // Transcript should be shown
      cy.get('.transcript-section').should('contain.text', 'This is a valid transcription');
    });

    it('should successfully upload medium-sized video file', () => {
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 200,
        body: {
          transcript: 'Video transcription successful',
          segments: [
            { text: 'Video transcription successful', startMs: 0, endMs: 3000 }
          ]
        }
      }).as('uploadVideo');

      // Medium file (5MB) - below typical limit
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(5 * 1024 * 1024),
        fileName: 'medium-video.mp4',
        mimeType: 'video/mp4'
      }, { force: true });

      cy.wait('@uploadVideo');

      cy.get('.alert-error').should('not.exist');
      cy.get('.transcript-section').should('contain.text', 'Video transcription successful');
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after size limit error', () => {
      // First attempt - too large
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 413
      }).as('firstAttempt');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(100 * 1024 * 1024),
        fileName: 'huge.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@firstAttempt');
      cy.get('.alert-error').should('be.visible');

      // Retry with smaller file
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 200,
        body: {
          transcript: 'Retry successful',
          segments: [{ text: 'Retry successful', startMs: 0, endMs: 1500 }]
        }
      }).as('retryAttempt');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(512 * 1024),
        fileName: 'smaller.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@retryAttempt');

      // Should show success
      cy.get('.alert-error').should('not.exist');
      cy.get('.transcript-section').should('contain.text', 'Retry successful');
    });

    it('should not break UI after multiple failed uploads', () => {
      // Multiple failed attempts
      for (let i = 0; i < 3; i++) {
        cy.intercept('POST', '**/api/pronunciation/transcribe', {
          statusCode: 413
        }).as(`failedUpload${i}`);

        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.alloc(50 * 1024 * 1024),
          fileName: `large${i}.mp3`,
          mimeType: 'audio/mpeg'
        }, { force: true });

        cy.wait(`@failedUpload${i}`);
        cy.get('.alert-error').should('be.visible');
      }

      // UI should still be functional
      cy.contains('button', 'Upload Audio/Video').should('not.be.disabled');
      cy.get('.language-select').should('be.visible');
    });
  });

  describe('Different File Types', () => {
    const testCases = [
      { fileName: 'audio.mp3', mimeType: 'audio/mpeg', description: 'MP3 audio' },
      { fileName: 'audio.wav', mimeType: 'audio/wav', description: 'WAV audio' },
      { fileName: 'audio.ogg', mimeType: 'audio/ogg', description: 'OGG audio' },
      { fileName: 'video.mp4', mimeType: 'video/mp4', description: 'MP4 video' },
      { fileName: 'video.webm', mimeType: 'video/webm', description: 'WebM video' }
    ];

    testCases.forEach(({ fileName, mimeType, description }) => {
      it(`should handle size limit error for ${description} files`, () => {
        cy.intercept('POST', '**/api/pronunciation/transcribe', {
          statusCode: 413
        }).as('uploadFile');

        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.alloc(50 * 1024 * 1024),
          fileName,
          mimeType
        }, { force: true });

        cy.wait('@uploadFile');
        cy.get('.alert-error')
          .should('be.visible')
          .and('contain.text', 'File too large');
      });
    });
  });

  describe('UI State During Upload', () => {
    it('should disable controls during upload attempt', () => {
      cy.intercept('POST', '**/api/pronunciation/transcribe', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 413
        });
      }).as('slowUpload');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(1024),
        fileName: 'test.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      // While uploading, button should be disabled
      cy.contains('button', 'Upload Audio/Video').should('be.disabled');

      cy.wait('@slowUpload');

      // After error, button should be enabled again
      cy.contains('button', 'Upload Audio/Video').should('not.be.disabled');
    });

    it('should clear error message when starting new upload', () => {
      // First upload fails
      cy.intercept('POST', '**/api/pronunciation/transcribe', {
        statusCode: 413
      }).as('firstUpload');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(1024),
        fileName: 'test1.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.wait('@firstUpload');
      cy.get('.alert-error').should('be.visible');

      // Start new upload - error should clear before new attempt
      cy.intercept('POST', '**/api/pronunciation/transcribe', (req) => {
        req.reply({
          delay: 500,
          statusCode: 200,
          body: { transcript: 'Success', segments: [] }
        });
      }).as('secondUpload');

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.alloc(1024),
        fileName: 'test2.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      // Error should be cleared when new upload starts
      cy.get('.alert-error').should('not.exist');
    });
  });
});

