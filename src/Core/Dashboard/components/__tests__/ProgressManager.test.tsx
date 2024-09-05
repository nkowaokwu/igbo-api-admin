import React from 'react';
import { render } from '@testing-library/react';
import ProgressManager from 'src/Core/Dashboard/components/ProgressManager';
import TestContext from 'src/__tests__/components/TestContext';

describe('ProgressManager', () => {
  it('renders all lexicographer options', async () => {
    const { findByText } = render(
      <TestContext>
        <ProgressManager />
      </TestContext>,
    );

    await findByText('Create a New Word');
    await findByText('Create a New Example Sentence');
    await findByText('Create a New Nsịbịdị Character');
    await findByText('Edit an Existing Word');
    await findByText('Edit an Existing Example Sentence');
    await findByText('Edit an Existing Nsịbịdị Character');
  });
});
