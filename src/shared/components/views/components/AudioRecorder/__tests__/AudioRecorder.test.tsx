import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import AudioRecorder from '../AudioRecorder';

describe('AudioRecorder', () => {
  it('render AudioRecorder start button', async () => {
    const { findByText, findByTestId } = render(
      <TestContext
        groupIndex={0}
        path="examples"
        getValues={() => null}
        setValue={() => null}
      >
        <AudioRecorder />
      </TestContext>,
    );
    await findByText('Word Pronunciation');
    await findByTestId('start-recording-button-examples');
    await findByTestId('reset-recording-button-examples');
  });

  it('render AudioRecorder stop button', async () => {
    const { findByText, findByTestId } = render(
      <TestContext
        groupIndex={0}
        path="examples"
        getValues={() => null}
        setValue={() => null}
      >
        <AudioRecorder />
      </TestContext>,
    );
    await findByText('Word Pronunciation');
    fireEvent.click(await findByTestId('start-recording-button-examples'));
    await findByTestId('reset-recording-button-examples');
  });
});
