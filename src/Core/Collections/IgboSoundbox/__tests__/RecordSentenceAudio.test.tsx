import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext, { mocks } from 'src/__tests__/components/TestContext';
import * as reactAdmin from 'react-admin';
import UserRoles from 'src/backend/shared/constants/UserRoles';
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
    await findByText(
      // eslint-disable-next-line max-len
      'Sentence may contain grammatical and spelling errors. Record audio to match the exact spelling of each word.',
    );
    await findByText('Submit');
  });

  it('record audio', async () => {
    const { findByTestId } = render(
      <TestContext>
        <RecordSentenceAudio />
      </TestContext>,
    );
    userEvent.click(await findByTestId('start-recording-button-pronunciation'));
  });

  it('renders the example sentence', async () => {
    const { findByText } = render(
      <TestContext>
        <RecordSentenceAudio />
      </TestContext>,
    );
    await findByText('igbo 1');
  });

  it('copies resource link', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: UserRoles.CROWDSOURCER } });

    const { findByText, findByLabelText } = render(
      <TestContext>
        <RecordSentenceAudio />
      </TestContext>,
    );
    userEvent.click(await findByText('Copy resource link'));
    expect(mocks.clipboard.writeText).toHaveBeenCalledWith('https://localhost/#/exampleSuggestions/first id/show');
    userEvent.click(await findByLabelText('Next sentence'));
    userEvent.click(await findByText('Copy resource link'));
    expect(mocks.clipboard.writeText).toHaveBeenCalledWith('https://localhost/#/exampleSuggestions/second id/show');
    userEvent.click(await findByLabelText('Next sentence'));
    userEvent.click(await findByText('Copy resource link'));
    expect(mocks.clipboard.writeText).toHaveBeenCalledWith('https://localhost/#/exampleSuggestions/third id/show');
    userEvent.click(await findByLabelText('Next sentence'));
    userEvent.click(await findByText('Copy resource link'));
    expect(mocks.clipboard.writeText).toHaveBeenCalledWith('https://localhost/#/exampleSuggestions/fourth id/show');
    userEvent.click(await findByLabelText('Next sentence'));
    userEvent.click(await findByText('Copy resource link'));
    expect(mocks.clipboard.writeText).toHaveBeenCalledWith('https://localhost/#/exampleSuggestions/fifth id/show');
  });
});
