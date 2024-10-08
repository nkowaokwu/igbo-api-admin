import React from 'react';
import { render } from '@testing-library/react';
import MilestoneProgress from 'src/Core/Stats/components/MilestoneProgress';
import TestContext from 'src/__tests__/components/TestContext';

describe('MilestoneProgress', () => {
  it('renders all the stats', async () => {
    const { findByText } = render(
      <TestContext>
        <MilestoneProgress />
      </TestContext>,
    );

    await findByText('Project Stats');
    await findByText('Audio Stats');
    await findByText('Word Stats');
    await findByText('Nsịbịdị Stats');
    await findByText('Example Stats');
  });
});
