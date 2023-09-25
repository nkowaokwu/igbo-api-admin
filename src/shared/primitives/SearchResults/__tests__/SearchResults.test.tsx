import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { wordSuggestionData, exampleSuggestionData, nsibidiCharacterData } from 'src/__tests__/__mocks__/documentData';
import Collection from 'src/shared/constants/Collection';
import SearchResults from '../SearchResults';

const wordResult = wordSuggestionData;
const exampleResult = exampleSuggestionData;
const nsibidiCharacterResult = nsibidiCharacterData;

describe('SearchResults', () => {
  it('render the word results', async () => {
    const autoCompleteResults = [wordResult];
    const { findByText } = render(
      <TestContext>
        <SearchResults
          inputRef={{ current: { clientHeight: 100 } }}
          autoCompleteResults={autoCompleteResults}
          collection={Collection.WORD_SUGGESTIONS}
        />
      </TestContext>,
    );

    await findByText(wordResult.word);
    await findByText(wordResult.definitions[0].wordClass);
    await findByText(wordResult.definitions[0].definitions[0]);
  });
  it('render the example results', async () => {
    const autoCompleteResults = [exampleResult];
    const { findByText } = render(
      <TestContext>
        <SearchResults
          inputRef={{ current: { clientHeight: 100 } }}
          autoCompleteResults={autoCompleteResults}
          collection={Collection.EXAMPLE_SUGGESTIONS}
        />
      </TestContext>,
    );

    await findByText(exampleResult.igbo);
    await findByText(exampleResult.english);
  });
  it('render the nsibidi character results', async () => {
    const autoCompleteResults = [nsibidiCharacterResult];
    const { findByText } = render(
      <TestContext>
        <SearchResults
          inputRef={{ current: { clientHeight: 100 } }}
          autoCompleteResults={autoCompleteResults}
          collection={Collection.NSIBIDI_CHARACTERS}
        />
      </TestContext>,
    );

    await findByText(nsibidiCharacterResult.nsibidi);
    await findByText(nsibidiCharacterResult.pronunciation);
    await findByText(nsibidiCharacterResult.definitions[0].text);
  });
  it('render the loading state', async () => {
    const autoCompleteResults = [nsibidiCharacterResult];
    const { findByText } = render(
      <TestContext>
        <SearchResults
          inputRef={{ current: { clientHeight: 100 } }}
          isSearchingAutoCompleteResults
          autoCompleteResults={autoCompleteResults}
          collection={Collection.NSIBIDI_CHARACTERS}
        />
      </TestContext>,
    );

    await findByText('Loading...');
  });
});
