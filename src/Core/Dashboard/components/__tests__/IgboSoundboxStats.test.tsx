import React from 'react';
import { render } from '@testing-library/react';
import IgboSoundboxStats from 'src/Core/Dashboard/components/IgboSoundboxStats';
import TestContext from 'src/__tests__/components/TestContext';

it('IgboSoundboxStats', async () => {
  const { findByText } = render(
    <TestContext
      recordingStats={{ recorded: 0, verified: 0, mergedRecorded: {} }}
      audioStats={{ audioApprovalsCount: 0, audioDenialsCount: 0 }}
    >
      <IgboSoundboxStats />
    </TestContext>,
  );
  await findByText('Igbo Soundbox Contributions');
  await findByText('Community Reviews');
  await findByText('Contributions that you have made on the platform');
  await findByText('Other platform contributors reviewing your audio');
  await findByText('Approved audio recordings');
  await findByText('Denied audio recordings');
  await findByText('Previous month');
  await findByText('Next month');
  await findByText('Monthly merged recorded audio');
  await findByText('The number of merged (verified) recorded audio for each month');
});
