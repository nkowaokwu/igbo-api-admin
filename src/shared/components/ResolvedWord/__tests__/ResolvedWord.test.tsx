import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import ResolvedWord from '../ResolvedWord';

describe('Resolved Word', () => {
  it('render the resolved word', async () => {
    const wordId = 'word-id';
    const { findByText } = render(
      <TestContext>
        <ResolvedWord wordId={wordId} isSuggestion={false} />
      </TestContext>,
    );

    await findByText('retrieved word');
  });

  it('render the resolved word suggestion', async () => {
    const wordId = 'word-id';
    const { findByText } = render(
      <TestContext>
        <ResolvedWord wordId={wordId} isSuggestion />
      </TestContext>,
    );

    await findByText('retrieved word suggestion');
  });
});
