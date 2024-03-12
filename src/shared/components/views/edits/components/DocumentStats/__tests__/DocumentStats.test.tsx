import React from 'react';
import TestContext from 'src/__tests__/components/TestContext';
import { render } from '@testing-library/react';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats/DocumentStats';
import Collection from 'src/shared/constants/Collection';
import { wordSuggestionFixture } from 'src/__tests__/shared/fixtures';

describe('DocumentStats', () => {
  it('renders the document stats', async () => {
    const record = wordSuggestionFixture({
      id: 'word-id',
      originalWordId: 'original-word-id',
      approvals: ['approval'],
    });
    const { findByText } = render(
      <TestContext>
        <DocumentStats
          collection={Collection.WORDS}
          title="Parent Word Id:"
          originalId={record.originalWordId}
          record={record}
          id={record.id}
          approvals={record.approvals}
          denials={record.denials}
        />
      </TestContext>,
    );
    await findByText('Id:');
    await findByText('word-id');
    await findByText('Parent Word Id:');
    await findByText('original-word-id');
    await findByText('Approvals:');
    await findByText('1');
    await findByText('Denials:');
    await findByText('0');
  });

  it('does not render approvals and denials', async () => {
    const record = wordSuggestionFixture({
      id: 'word-id',
      originalWordId: 'original-word-id',
    });
    const { findByText, queryByText } = render(
      <TestContext>
        <DocumentStats
          collection={Collection.WORDS}
          title="Parent Word Id:"
          originalId={record.originalWordId}
          record={record}
          id={record.id}
        />
      </TestContext>,
    );
    await findByText('Id:');
    await findByText('word-id');
    await findByText('Parent Word Id:');
    await findByText('original-word-id');
    expect(queryByText('Approvals:')).toBeNull();
    expect(queryByText('Denials:')).toBeNull();
  });
});
