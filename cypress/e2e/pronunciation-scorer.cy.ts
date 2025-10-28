
describe('Navigation and Basic UI', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the application header', () => {
    cy.get('.app-header').should('be.visible');
    cy.get('.brand-title').should('contain.text', 'Pronunciation AI');
    cy.get('.brand-subtitle').should('contain.text', 'Advanced Speech Analysis');
  });

  it('should display navigation links', () => {
    cy.get('.header-nav').should('be.visible');
    cy.get('.nav-link').should('have.length', 2);
    cy.get('.nav-link').first().should('contain.text', 'Analyze');
    cy.get('.nav-link').last().should('contain.text', 'Transcribe');
  });

  it('should navigate to the pronunciation scorer page by default', () => {
    cy.get('.pronunciation-scorer').should('exist');
    cy.get('.intro-title').should('contain.text', 'Perfect Your Pronunciation');
  });

  it('should navigate to the transcribe page', () => {
    cy.get('.nav-link').contains('Transcribe').click();
    cy.url().should('include', '/transcribe');
    cy.get('.live-transcriber').should('exist');
    cy.get('.intro-title').should('contain.text', 'Live Speech to Text');
  });

  it('should navigate back to analyze page', () => {
    cy.get('.nav-link').contains('Transcribe').click();
    cy.url().should('include', '/transcribe');

    cy.get('.nav-link').contains('Analyze').click();
    cy.url().should('not.include', '/transcribe');
    cy.get('.pronunciation-scorer').should('exist');
  });

  it('should display the footer', () => {
    cy.get('.app-footer').should('be.visible');
    cy.get('.footer-content').should('contain.text', 'Powered by advanced AI');
    cy.get('.footer-link').should('have.attr', 'href').and('include', 'github.com');
  });

  it('should have active link styling', () => {
    cy.get('.nav-link').first().should('have.class', 'active');

    cy.get('.nav-link').contains('Transcribe').click();
    cy.get('.nav-link').last().should('have.class', 'active');
    cy.get('.nav-link').first().should('not.have.class', 'active');
  });
});

