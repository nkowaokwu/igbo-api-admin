import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from 'src/Core/Dashboard';
import TestContext from 'src/__tests__/components/TestContext';

jest.mock('src/shared/DataCollectionAPI');

it('render the dashboard', async () => {
  const { findByText, findAllByText } = render(<TestContext><Dashboard /></TestContext>);
  await findByText('"Complete" Words');
  await findByText('"Sufficient" Words');
  await findAllByText('Dialectal Variations');
  await findByText('Headwords with Audio Pronunciations');
  await findByText('Words with Nsịbịdị');
  await findByText('Word Suggestions with Nsịbịdị');
  await findByText('Standard Igbo Words');
  await findByText('Words with Igbo Definitions');
  await findByText('Sufficient Igbo Example Sentences');
  await findByText('Complete Igbo Example Sentences');
  await findByText('Recorded example sentences');
  await findByText('Verified example sentences');
});
