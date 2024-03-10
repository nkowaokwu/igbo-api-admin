import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import useRecorder from 'src/hooks/useRecorder';
import RecorderBase from '../RecorderBase';

describe('RecorderBase', () => {
  it('render RecorderBase', async () => {
    const mockStopRecording = jest.fn(() => null);
    const mockResetRecording = jest.fn(() => null);
    const { findByText } = render(
      <TestContext onStopRecording={mockStopRecording} onResetRecording={mockResetRecording}>
        <RecorderBase />
      </TestContext>,
    );
    await findByText('No audio pronunciation');
  });

  it('click on stop recording button', async () => {
    const mockStopRecording = jest.fn(() => null);
    const mockResetRecording = jest.fn(() => null);
    // @ts-expect-error
    useRecorder.mockImplementation(() => ['audioBlob', true, () => null, () => null, 0]);
    const { findByText, findByTestId } = render(
      <TestContext onStopRecording={mockStopRecording} onResetRecording={mockResetRecording} path="examples">
        <RecorderBase />
      </TestContext>,
    );

    fireEvent.click(await findByTestId('stop-recording-button-examples'));
    await findByText('Recorded new audio');
    await findByText('A new audio pronunciation has been recorded');

    expect(mockStopRecording).toHaveBeenCalledWith('audioBlob');
  });

  it('click on reset recording button', async () => {
    const mockStopRecording = jest.fn(() => null);
    const mockResetRecording = jest.fn(() => null);
    // @ts-expect-error
    useRecorder.mockImplementation(() => ['', false, () => null, () => null, 0]);
    const { findByTestId } = render(
      <TestContext onStopRecording={mockStopRecording} onResetRecording={mockResetRecording} path="examples">
        <RecorderBase />
      </TestContext>,
    );
    fireEvent.click(await findByTestId('reset-recording-button-examples'));

    expect(mockResetRecording).toHaveBeenCalled();
  });
});
