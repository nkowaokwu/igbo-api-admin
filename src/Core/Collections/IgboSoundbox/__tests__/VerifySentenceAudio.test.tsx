import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import VerifySentenceAudio from '../VerifySentenceAudio';

describe('VerifySentenceAudio', () => {
  it('render page to show five example sentences', async () => {
    const { findByText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('Listen to know if this sentence matches the audio');
    await findByText('Deny');
    await findByText('Approve');
    await findByText('Complete');
  });

  it('deny and approve sentences', async () => {
    const { findByText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    userEvent.click(await findByText('Deny'));
    userEvent.click(await findByText('Approve'));
    await findByText('3 / 5');
  });
});
