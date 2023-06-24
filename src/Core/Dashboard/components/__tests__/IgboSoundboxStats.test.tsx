import React from 'react';
import { render } from '@testing-library/react';
import IgboSoundboxStats from 'src/Core/Dashboard/components/IgboSoundboxStats';
import TestContext from 'src/__tests__/components/TestContext';

it('IgboSoundboxStats', async () => {
  const { findByText } = render(
    <TestContext recordingStats={{ recorded: 0, verified: 0 }}>
      <IgboSoundboxStats />
    </TestContext>,
  );
  await findByText('Igbo Soundbox Contributions');
  await findByText('Your personalized Igbo Soundbox statistics');
});
