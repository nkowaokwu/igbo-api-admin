import React from 'react';
import moment from 'moment';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import * as reactAdmin from 'react-admin';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import IgboSoundboxStats, { calculatePayment } from '../IgboSoundboxStats';

describe('IgboSoundboxStats', () => {
  it('renders the IgboSoundboxStats component', async () => {
    const { findByText } = render(
      <TestContext
        recordingStats={{ recorded: {}, verified: {}, mergedRecorded: {} }}
        audioStats={{ timestampedAudioApprovals: {}, timestampedAudioDenials: {} }}
      >
        <IgboSoundboxStats />
      </TestContext>,
    );
    await findByText('Contributions');
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

  it('render the Igbo soundbox stats component as admin', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: UserRoles.ADMIN } });
    const recordingStats = {
      recorded: { [moment().format('MMM, YYYY')]: 10 },
      verified: { [moment().format('MMM, YYYY')]: 15 },
      mergedRecorded: {},
    };
    const audioStats = {
      timestampedAudioApprovals: {
        [moment().format('MMM, YYYY')]: 20,
      },
      timestampedAudioDenials: {
        [moment().format('MMM, YYYY')]: 25,
      },
    };
    const { findByText } = render(
      <TestContext>
        <IgboSoundboxStats recordingStats={recordingStats} audioStats={audioStats} />
      </TestContext>,
    );

    await findByText('Recorded example sentence audio');
    await findByText('Reviewed example sentence audio');
    await findByText('Approved audio recordings');
    await findByText('Denied audio recordings');
    await findByText('Monthly merged recorded audio');
    await findByText('The number of merged (verified) recorded audio for each month');
    await findByText('Previous month');
    await findByText('Next month');
    await findByText(`Total recorded audio for ${moment().format('MMM, YYYY')}`);
    await findByText('Price to be paid to the user:');
    await findByText('$0.32');
    await findByText('10');
    await findByText('15');
    await findByText('20');
    await findByText('25');
    await findByText('0');
  });

  it('hides the payment calculation for non admins', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: UserRoles.CROWDSOURCER } });
    const recordingStats = {
      recorded: { [moment().format('MMM, YYYY')]: 10 },
      verified: { [moment().format('MMM, YYYY')]: 15 },
      mergedRecorded: {},
    };
    const audioStats = {
      timestampedAudioApprovals: {
        [moment().format('MMM, YYYY')]: 20,
      },
      timestampedAudioDenials: {
        [moment().format('MMM, YYYY')]: 25,
      },
    };
    const { findByText, queryByText } = render(
      <TestContext>
        <IgboSoundboxStats recordingStats={recordingStats} audioStats={audioStats} />
      </TestContext>,
    );

    await findByText('Recorded example sentence audio');
    await findByText('Reviewed example sentence audio');
    await findByText('Approved audio recordings');
    await findByText('Denied audio recordings');
    await findByText('Monthly merged recorded audio');
    await findByText('The number of merged (verified) recorded audio for each month');
    await findByText('Previous month');
    await findByText('Next month');
    await findByText(`Total recorded audio for ${moment().format('MMM, YYYY')}`);
    await findByText('10');
    await findByText('15');
    await findByText('20');
    await findByText('25');
    await findByText('0');
    expect(queryByText('Price to be paid to the user:')).toBeNull();
    expect(queryByText('$0.00')).toBeNull();
  });

  it('calculates the expected payment', () => {
    const recordings = 5000;
    const reviews = 15000;
    expect(calculatePayment(recordings, reviews)).toEqual('$260.00');
  });

  it('returns no dollars for invalid string input', () => {
    // @ts-expect-error
    expect(calculatePayment('invalid', 1000)).toEqual('$0.00');
  });

  it('returns no dollars for invalid NaN input', () => {
    expect(calculatePayment(parseInt('invalid', 10), 1000)).toEqual('$0.00');
  });
});
