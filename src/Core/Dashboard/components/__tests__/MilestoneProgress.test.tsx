import React from 'react';
import { render } from '@testing-library/react';
import MilestoneProgress from 'src/Core/Stats/components/MilestoneProgress';
import TestContext from 'src/__tests__/components/TestContext';

it('MilestoneProgress', async () => {
  const { findByText } = render(
    <TestContext recordingStats={{ recorded: 0, verified: 0 }}>
      <MilestoneProgress />
    </TestContext>,
  );
  await findByText('Project Stats');
  await findByText('Track the total progress of the project.');
  await findByText('Word Stats');
  await findByText('Nsịbịdị Stats');
  await findByText('Example Stats');
  await findByText('Audio Stats');
});
