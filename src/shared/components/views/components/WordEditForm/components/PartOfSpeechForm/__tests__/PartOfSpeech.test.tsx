import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import WordClass from 'src/backend/shared/constants/WordClass';
import PartOfSpeech from '../PartOfSpeechForm';

describe('PartOfSpeech', () => {
  it('render part of speech within dropdown', async () => {
    const { findByText, queryByText } = render(
      <TestContext groupIndex={0}>
        <PartOfSpeech />
      </TestContext>,
    );
    await findByText('Part of Speech');
    await findByText('Active verb');
    expect(await queryByText('Adjective')).toBeNull();
  });

  it('render part of speech within dropdown and select', async () => {
    const { findByText, getByText, getAllByText, findByTestId, queryByText } = render(
      <TestContext groupIndex={0}>
        <PartOfSpeech />
      </TestContext>,
    );
    const partOfSpeechSelect = await findByTestId('word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });
    Object.values(WordClass).forEach(({ label }) => {
      if (label !== WordClass.AV.label) {
        getByText(label);
      } else {
        getAllByText(label);
      }
    });
    userEvent.click(await findByText('Noun'));
    Object.values(WordClass).forEach(({ label }) => {
      if (label !== WordClass.NNC.label) {
        expect(queryByText(label)).toBeNull();
      } else {
        getByText(label);
      }
    });
  });
});
