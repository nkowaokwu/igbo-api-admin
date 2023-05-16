import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import NsibidiForm from '../NsibidiForm';

describe('NsibidiForm', () => {
  it('renders the nsibidi input', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext groupIndex={0}>
        <NsibidiForm />
      </TestContext>,
    );
    await findByText('Nsịbịdị');
    await findByPlaceholderText('Input in Nsịbịdị');
  });

  it('renders dropdown options', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext groupIndex={0}>
        <NsibidiForm />
      </TestContext>,
    );
    userEvent.type(await findByPlaceholderText('Input in Nsịbịdị'), 'nsibidi');
    await findByText('first pronunciation');
    await findByText('first definition');
  });
});
