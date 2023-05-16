import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import StemsForm from '../StemsForm';

describe('StemsForm', () => {
  it('renders the stems', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext groupIndex={0}>
        <StemsForm />
      </TestContext>,
    );
    await findByText('Word Stems');
    await findByPlaceholderText('Search for stem or use word id');
    await findByText('No stems');
  });
});
