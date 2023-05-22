import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import ExampleAudioPronunciationsForm from '../ExampleAudioPronunciationsForm';

describe('ExampleAudioPronunciationsForm', () => {
  it('render ExampleAudioPronunciationsForm', async () => {
    const { findByText } = render(
      <TestContext groupIndex={0}>
        <ExampleAudioPronunciationsForm />
      </TestContext>,
    );
    await findByText('Igbo Sentence Recordings');
    await findByText('Add Audio Pronunciation');
  });
});
