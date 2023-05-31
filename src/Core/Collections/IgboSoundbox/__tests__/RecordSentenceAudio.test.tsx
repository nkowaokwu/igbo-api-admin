import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import RecordSentenceAudio from '../RecordSentenceAudio';

describe('RecordSentenceAudio', () => {
  it('render page to show five example sentences', async () => {
    const { findByText } = render(
      <TestContext>
        <RecordSentenceAudio />
      </TestContext>,
    );
    await findByText('Record sentence audio');
    await findByText('Play audio and then record audio for each sentence');
    await findByText('No audio pronunciation');
    await findByText('Submit Batch');
  });

  it('record audio', async () => {
    const { findByTestId } = render(
      <TestContext>
        <RecordSentenceAudio />
      </TestContext>,
    );
    userEvent.click(await findByTestId('start-recording-button-pronunciation'));
  });
});
