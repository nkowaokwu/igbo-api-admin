import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { wordSuggestionData } from 'src/__tests__/__mocks__/documentData';
import WordResult from '../WordResult';

const result = wordSuggestionData;

describe('WordResult', () => {
  it('render the word results', async () => {
    const { findByText } = render(
      <TestContext>
        <WordResult result={result} />
      </TestContext>,
    );

    await findByText(result.word);
    await findByText(result.definitions[0].wordClass);
    await findByText(result.definitions[0].definitions[0]);
  });
});
