import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from 'src/Core/Dashboard';
import TestContext from 'src/__tests__/components/TestContext';

jest.mock('src/shared/DataCollectionAPI');
jest.mock('src/Core/Dashboard/network');

it('render the dashboard', async () => {
  const { findByTestId } = render(
    <TestContext>
      <Dashboard />
    </TestContext>,
  );
  await findByTestId('dashboard');
});
