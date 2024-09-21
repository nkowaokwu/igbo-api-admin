// Guide on mocking dataProvider
// https://github.com/marmelab/react-admin/pull/6753/files
import React from 'react';
import { render, configure } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import WordClass from 'src/backend/shared/constants/WordClass';
import { definitionFixture, exampleFixture, pronunciationFixture, wordFixture } from 'src/__tests__/shared/fixtures';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import WordShow from '../WordShow';

configure({ testIdAttribute: 'data-test' });

const record = wordFixture({
  word: 'tésting word',
  definitions: [
    definitionFixture({
      wordClass: WordClassEnum.ADJ,
      definitions: ['first definition'],
    }),
  ],
  variations: [],
  examples: [
    exampleFixture({
      igbo: 'igbo',
      english: 'english',
    }),
  ],
  pronunciation: '1234',
  attributes: {
    ...Object.values(WordAttributeEnum).reduce(
      (finalAttributes, attribute) => ({ ...finalAttributes, [attribute]: false }),
      {} as { [key in WordAttributeEnum]: boolean },
    ),
    isStandardIgbo: true,
  },
});

const completeRecord = wordFixture({
  ...record,
  examples: [
    exampleFixture({
      igbo: 'igbo',
      english: 'english',
      pronunciations: [pronunciationFixture({ audio: 'example-pronunciation' })],
      associatedWords: ['associatedWordId'],
    }),
  ],
  pronunciation: 'word-pronunciation',
  stems: ['stemId'],
  relatedTerms: ['relatedTermId'],
  dialects: [
    {
      variations: [],
      dialects: [DialectEnum.NSA],
      pronunciation: 'dialect-pronunciation',
      word: 'word',
    },
  ],
});

const dataProvider = {
  getOne: () =>
    Promise.resolve({
      data: record,
    }),
};

describe('Word Show', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
    dataProvider.getOne = () =>
      Promise.resolve({
        data: record,
      });
  });

  it('render all fields for words', async () => {
    const { queryByText, findAllByText, findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { words: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <WordShow basePath="/" resource={Collections.WORDS} id={record.id} />
      </TestContext>,
    );

    await findByText('Word');
    await findByText('Audio Pronunciation');
    await findByText('Is Standard Igbo');
    await findAllByText('Is Accented');
    await findByText('Is Slang');
    await findByText('Is Constructed Term');
    await findByText('Nsịbịdị');
    await findByText('Nsịbịdị Characters');
    await findByText('Definition Groups');
    await findByText('Part of Speech');
    await findByText('English Definitions');
    await findByText('Igbo Definitions');
    await findByText('Variations');
    await findByText('Word Stems');
    await findByText('Examples');
    await findByText('Dialects');
    expect(await queryByText("Editor's Note")).toBeNull();
    expect(await queryByText("User's comments")).toBeNull();
  });

  it('render all fields for word suggestions', async () => {
    const { findByText, findAllByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { wordSuggestions: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <WordShow basePath="/" resource={Collections.WORD_SUGGESTIONS} id={record.id} />
      </TestContext>,
    );

    await findByText('Word Draft');
    await findByText('Audio Pronunciation');
    await findByText('Is Standard Igbo');
    await findAllByText('Is Accented');
    await findByText('Is Slang');
    await findByText('Is Constructed Term');
    await findByText(record.word);
    await findByText('Nsịbịdị');
    await findByText('Part of Speech');
    await findByText('Definition Groups');
    await findByText(WordClass[record.definitions[0].wordClass].label);
    await findByText('English Definitions');
    await findByText('Igbo Definitions');
    await findByText(record.definitions[0].definitions[0]);
    await findByText('Variations');
    await findByText('Word Stems');
    await findByText('Examples');
    await findByText('Dialects');
    await findByText("Editor's Note");
    await findByText("User's comments");
  });

  // Unable to test Tooltip component
  it.skip('render as a insufficient word suggestion', async () => {
    const { findByText, findByTestId } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { wordSuggestions: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <WordShow basePath="/" resource={Collections.WORD_SUGGESTIONS} id={record.id} />
      </TestContext>,
    );

    await findByTestId('insufficient-document-label');
    await findByText('A word stem is needed');
  });

  // Unable to test Tooltip component
  it.skip('render as a complete word suggestion', async () => {
    dataProvider.getOne = () =>
      Promise.resolve({
        data: completeRecord,
      });

    const { findByTestId } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { wordSuggestions: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <WordShow basePath="/" resource={Collections.WORD_SUGGESTIONS} id={record.id} />
      </TestContext>,
    );
    await findByTestId('complete-document-label');
  });
});
