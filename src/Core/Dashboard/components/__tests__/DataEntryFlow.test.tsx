import React from 'react';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';

describe('DataEntryFlow', () => {
  it('renders a data entry flow component', async () => {
    const { findByText } = render(
      <TestContext>
        <DataEntryFlow title="title" subtitle="subtitle" icon="" hash="" />
      </TestContext>,
    );

    await findByText('title');
    await findByText('subtitle');
  });
});
