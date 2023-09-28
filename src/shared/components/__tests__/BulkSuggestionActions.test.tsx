import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import BulkSuggestionActions from '../BulkSuggestionActions';

describe('BulkSuggestionActions', () => {
  it('renders the Merge and Delete buttons', async () => {
    const { findByText } = render(
      <TestContext>
        <BulkSuggestionActions />
      </TestContext>,
    );

    await findByText('Merge');
    await findByText('Delete');
  });

  it('renders Merge confirmation modal', async () => {
    const { findByText, findAllByText } = render(
      <TestContext>
        <BulkSuggestionActions />
      </TestContext>,
    );

    fireEvent.click(await findByText('Merge'));
    await findByText('Merge Document');
    await findByText('Are you sure you want to merge this document?');
    await findAllByText('Merge');
  });

  it('renders Delete confirmation modal', async () => {
    const { findByText } = render(
      <TestContext>
        <BulkSuggestionActions />
      </TestContext>,
    );

    fireEvent.click(await findByText('Delete'));
    await findByText('Bulk Delete Documents');
    await findByText(
      'Are you sure you want to delete these documents? The original document creators will get a notification email.',
    );
  });
});
