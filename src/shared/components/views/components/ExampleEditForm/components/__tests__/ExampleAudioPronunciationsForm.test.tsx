import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import ExampleAudioPronunciationsForm from '../ExampleAudioPronunciationsForm';

describe('ExampleAudioPronunciationsForm', () => {
  it('render ExampleAudioPronunciationsForm', async () => {
    const { findByText } = render(
      <TestContext>
        <ExampleAudioPronunciationsForm />
      </TestContext>,
    );
    await findByText('Sentence Recordings');
    await findByText('Add Audio Pronunciation');
  });

  it('adds a new audio recording', async () => {
    const { findByText, findByTestId, queryByTestId } = render(
      <TestContext
        record={{ pronunciations: [{ audio: 'first-audio', speaker: 'first-speaker' }] }}
        resource={Collections.EXAMPLE_SUGGESTIONS}
      >
        <ExampleAudioPronunciationsForm />
      </TestContext>,
    );
    await findByTestId('pronunciations.0.audio-audio-playback-container');
    await findByText('Sentence Recordings');
    userEvent.click(await findByText('Add Audio Pronunciation'));
    await findByTestId('pronunciations.1.audio-audio-playback-container');
    expect(queryByTestId('pronunciations.1.audio-audio-playback')).toBeNull();
    await findByText('No audio pronunciation');
  });
});
