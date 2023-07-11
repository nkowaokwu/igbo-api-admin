import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import RadicalsForm from '../RadicalsForm';

describe('RadicalsForm', () => {
  it('renders the stems', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext groupIndex={0}>
        <RadicalsForm />
      </TestContext>,
    );
    await findByText('Nsịbịdị Radicals');
    await findByPlaceholderText('Search for radical or use radical id');
    await findByText('No radicals');
  });
});
