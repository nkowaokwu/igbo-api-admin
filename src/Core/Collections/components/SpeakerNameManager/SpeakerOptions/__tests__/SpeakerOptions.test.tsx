// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import SpeakerOptions from '../SpeakerOptions';

describe('SpeakerOptions', () => {
  it('render the speaker options', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <SpeakerOptions />
      </TestContext>,
    );

    fireEvent.click(await findByTestId('speaker-options-menu-button'));
    await findByText('Report user');
  });
});
