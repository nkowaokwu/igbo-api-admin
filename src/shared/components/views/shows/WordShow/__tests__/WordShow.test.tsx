// Guide on mocking dataProvider
// https://github.com/marmelab/react-admin/pull/6753/files
import React from 'react';
import { render, configure } from '@testing-library/react';
import TestContext from 'src/tests/components/TestContext';

import { DataProviderContext } from 'react-admin';
import Collections from 'src/shared/constants/Collections';
import WordClass from 'src/shared/constants/WordClass';
import WordShow from '../WordShow';

configure({ testIdAttribute: 'data-test' });

const record = {
  id: 123,
  word: 'tésting word',
  definitions: [
    'first definition',
  ],
  wordClass: WordClass.ADJ.value,
  variations: [],
  examples: [{
    igbo: 'igbo',
    english: 'english',
    pronunciation: '',
    associatedWords: [],
  }],
  pronunciation: '1234',
  stems: [],
  synonyms: [],
  antonyms: [],
  dialects: {},
  attributes: {
    isStandardIgbo: true,
  },
  nsibidi: '',
};

const completeRecord = {
  ...record,
  examples: [{
    igbo: 'igbo',
    english: 'english',
    pronunciation: 'example-pronunciation',
    associatedWords: ['associatedWordId'],
  }],
  pronunciation: 'word-pronunciation',
  stems: ['stemId'],
  synonyms: ['synonymId'],
  antonyms: ['antonymId'],
  dialects: {
    word: {
      variations: [],
      dialects: ['NSA'],
      pronunciation: 'dialect-pronunciation',
    },
  },
  nsibidi: 'nsibidi',
};

const dataProvider = {
  getOne: () => Promise.resolve({
    data: record,
  }),
};

beforeEach(() => {
  document.getElementsByTagName('html')[0].innerHTML = '';
  dataProvider.getOne = () => Promise.resolve({
    data: record,
  });
});

it('render all fields for words', async () => {
  const { queryByText, findByText } = render(
    <TestContext
      enableReducers
      initialState={{ admin: { resources: { words: { data: {} } } } }}
    >
      {/* @ts-ignore */}
      <DataProviderContext.Provider value={dataProvider}>
        <WordShow basePath="/" resource={Collections.WORDS} id={record.id} />
      </DataProviderContext.Provider>
    </TestContext>,
  );

  await findByText('Word Document Details');
  await findByText('Audio Pronunciation');
  await findByText('Is Standard Igbo');
  await findByText('Is Accented');
  await findByText('Is Slang');
  await findByText('Is Constructed Term');
  await findByText('Nsịbịdị');
  await findByText('Part of Speech');
  await findByText('Definitions');
  await findByText('Variations');
  await findByText('Word Stems');
  await findByText('Synonyms');
  await findByText('Antonyms');
  await findByText('Examples');
  await findByText('Dialects');
  expect(await queryByText('Editor\'s Note')).toBeNull();
  expect(await queryByText('User\'s comments')).toBeNull();
});

it('render all fields for word suggestions', async () => {
  const { findByText } = render(
    <TestContext
      enableReducers
      initialState={{ admin: { resources: { wordSuggestions: { data: {} } } } }}
    >
      {/* @ts-ignore */}
      <DataProviderContext.Provider value={dataProvider}>
        <WordShow basePath="/" resource={Collections.WORD_SUGGESTIONS} id={record.id} />
      </DataProviderContext.Provider>
    </TestContext>,
  );

  await findByText('Word Suggestion Document Details');
  await findByText('Audio Pronunciation');
  await findByText('Is Standard Igbo');
  await findByText('Is Accented');
  await findByText('Is Slang');
  await findByText('Is Constructed Term');
  await findByText(record.word);
  await findByText('Nsịbịdị');
  await findByText('Part of Speech');
  await findByText(WordClass[record.wordClass].label);
  await findByText('Definitions');
  await findByText(record.definitions[0]);
  await findByText('Variations');
  await findByText('Word Stems');
  await findByText('Synonyms');
  await findByText('Antonyms');
  await findByText('Examples');
  await findByText('Dialects');
  await findByText('Editor\'s Note');
  await findByText('User\'s comments');
});

it('render as a sufficient word suggestion', async () => {
  const { findByText, findByTestId } = render(
    <TestContext
      enableReducers
      initialState={{ admin: { resources: { wordSuggestions: { data: {} } } } }}
    >
      {/* @ts-ignore */}
      <DataProviderContext.Provider value={dataProvider}>
        <WordShow basePath="/" resource={Collections.WORD_SUGGESTIONS} id={record.id} />
      </DataProviderContext.Provider>
    </TestContext>,
  );

  await findByTestId('sufficient-word-label');
  await findByText('A word stem is needed');
});

it('render as a complete word suggestion', async () => {
  dataProvider.getOne = () => Promise.resolve({
    data: completeRecord,
  });

  const { findByTestId } = render(
    <TestContext
      enableReducers
      initialState={{ admin: { resources: { wordSuggestions: { data: {} } } } }}
    >
      {/* @ts-ignore */}
      <DataProviderContext.Provider value={dataProvider}>
        <WordShow basePath="/" resource={Collections.WORD_SUGGESTIONS} id={record.id} />
      </DataProviderContext.Provider>
    </TestContext>,
  );
  await findByTestId('complete-word-label');
});
