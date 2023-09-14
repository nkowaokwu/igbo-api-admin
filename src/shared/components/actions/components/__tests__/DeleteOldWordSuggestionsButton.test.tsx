// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import DeleteOldWordSuggestionsButton from '../DeleteOldWordSuggestionsButton';

describe('DeleteOldWordSuggestionsButton', () => {
  it('render delete old word suggestions button', async () => {
    const { findByText } = render(
      <TestContext>
        <DeleteOldWordSuggestionsButton />
      </TestContext>,
    );

    await findByText('Delete old Word Suggestions');
  });

  it('open and close confirmation modal', async () => {
    const { queryByText, findByText } = render(
      <TestContext>
        <DeleteOldWordSuggestionsButton />
      </TestContext>,
    );

    expect(queryByText('Delete Old Word Suggestions')).toBeNull();
    fireEvent.click(await findByText('Delete old Word Suggestions'));
    await findByText('Delete Old Word Suggestions');
    fireEvent.click(await findByText('Cancel'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(queryByText('Delete Old Word Suggestions')).toBeNull();
  });
});
