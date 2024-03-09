import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import DocumentIds from 'src/shared/components/views/edits/components/DocumentIds';
import Collection from 'src/shared/constants/Collection';
import { wordSuggestionFixture } from 'src/__tests__/shared/fixtures';
import { determineDate } from 'src/shared/components/views/shows/utils';

describe('DocumentIds', () => {
  it('renders the document ids', async () => {
    const date = new Date();
    const record = wordSuggestionFixture({
      id: 'word-id',
      originalWordId: 'original-word-id',
      createdAt: date,
      updatedAt: date,
    });
    const { findByText } = render(
      <TestContext>
        <DocumentIds
          collection={Collection.WORDS}
          originalId={record.originalWordId}
          record={record}
          id={record.id}
          title="Parent Word Id:"
        />
      </TestContext>,
    );

    await findByText(`Last Updated: ${determineDate(date)}`);
    await findByText(`Created On: ${determineDate(date)}`);
    await findByText('Id:');
    await findByText('word-id');
    await findByText('Parent Word Id:');
    await findByText('original-word-id');
  });

  it('renders the document ids with no title', async () => {
    const date = new Date();
    const record = wordSuggestionFixture({
      id: 'word-id',
      originalWordId: 'original-word-id',
      createdAt: date,
      updatedAt: date,
    });
    const { findByText, queryByText } = render(
      <TestContext>
        <DocumentIds collection={Collection.WORDS} originalId={record.originalWordId} record={record} id={record.id} />
      </TestContext>,
    );

    await findByText(`Last Updated: ${determineDate(date)}`);
    await findByText(`Created On: ${determineDate(date)}`);
    await findByText('Id:');
    await findByText('word-id');
    expect(queryByText('Parent Word Id:')).toBeNull();
    expect(queryByText('original-word-id')).toBeNull();
  });
});
