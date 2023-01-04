describe('List', () => {
  before(() => {
    cy.cleanLogin();
  });

  describe.skip('Words', () => {
    before(() => {
      cy.selectCollection('words');
    });

    it('filter through filters', () => {
      cy.get('button').contains('Filters').scrollIntoView().click({ force: true });
      cy.findAllByRole('menuitemcheckbox').contains('Is Standard Igbo').click({ force: true });
      cy.get('[aria-checked="true"][value="isStandardIgbo"]').should('exist');
      cy.findAllByRole('menuitemcheckbox').contains('Has Pronunciation').click({ force: true });
      cy.get('[aria-checked="true"][value="pronunciation"]').should('exist');
      cy.findByLabelText('Clear filters').click();
    });

    it('select 10 rows from table pagination', () => {
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="0"]').contains('10').click();
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(10);
      });
    });

    it('select 25 rows from table pagination', () => {
      cy.intercept('GET', '**/words?filter=%7B%7D&range=%5B0%2C24%5D&sort=%5B%22id%22%2C%22ASC%22%5D').as('getWords');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="1"]').contains('25').click();
      cy.wait('@getWords');
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(25);
      });
    });

    it('select 50 rows from table pagination', () => {
      cy.intercept('GET', '**/words?filter=%7B%7D&range=%5B0%2C49%5D&sort=%5B%22id%22%2C%22ASC%22%5D').as('getWords');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="2"]').contains('50').click();
      cy.wait('@getWords');
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(50);
      });
    });
  });

  describe('Examples', () => {
    before(() => {
      cy.wait(5000);
      cy.selectCollection('examples');
    });

    it('select 10 rows from table pagination', () => {
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="0"]').contains('10').click();
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(10);
      });
    });

    it('select 25 rows from table pagination', () => {
      cy.intercept('GET', '**/examples?filter=%7B%7D&range=%5B0%2C24%5D&sort=%5B%22id%22%2C%22ASC%22%5D').as('getExamples');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="1"]').contains('25').click();
      cy.wait('@getExamples', { timeout: 20000 });
      cy.wait(2000);
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(25);
      });
    });

    it('select 50 rows from table pagination', () => {
      cy.intercept('GET', '**/examples?filter=%7B%7D&range=%5B0%2C49%5D&sort=%5B%22id%22%2C%22ASC%22%5D').as('getExamples');
      cy.get('#menu-button-per-page-menu').click();
      cy.get('button[data-index="2"]').contains('50').click();
      cy.wait('@getExamples', { timeout: 20000 });
      cy.wait(2000);
      cy.get('.datagrid-body').find('tr[class*="RaDatagrid-row-"]').then((res) => {
        expect(res.length).to.equal(50);
      });
    });
  });
});
