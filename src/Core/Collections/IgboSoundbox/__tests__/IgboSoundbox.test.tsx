import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import IgboSoundbox from '../IgboSoundbox';

describe('IgboSoundbox', () => {
  it('render IgboSoundbox homepage', async () => {
    const { findByText } = render(
      <TestContext>
        <IgboSoundbox />
      </TestContext>,
    );
    await findByText('Igbo Soundbox');
    await findByText('Record your voice');
    await findByText('Read out loud the example sentence in Igbo');
    await findByText('Verify recorded sentences');
    await findByText('Listen to Igbo recordings from other people and verify if the audio recordings are correct');
  });

  it('navigate to the RecordSentenceAudio page', async () => {
    const { findAllByText, findByText } = render(
      <TestContext>
        <IgboSoundbox />
      </TestContext>,
    );
    userEvent.click((await findAllByText('Start here'))[0]);
    await findByText('Record sentence audio');
    await findByText('Back');
    await findByText('Record audio');
    await findByText('Verify');
  });

  it('navigate to the VerifySentenceAudio page', async () => {
    const { findAllByText, findByText } = render(
      <TestContext>
        <IgboSoundbox />
      </TestContext>,
    );
    userEvent.click((await findAllByText('Start here'))[1]);
    await findByText('Listen to know if this sentence matches the audio');
    await findByText('Back');
    await findByText('Record audio');
    await findByText('Verify');
  });

  it('records audio and completes the form', async () => {
    const { findAllByText, findByText, findByTestId } = render(
      <TestContext>
        <IgboSoundbox />
      </TestContext>,
    );
    userEvent.click((await findAllByText('Start here'))[0]);
    userEvent.click(await findByTestId('start-recording-button'));
    userEvent.click(await findByTestId('stop-recording-button'));
    userEvent.click(await findByText('Submit Batch'));
  });
});
