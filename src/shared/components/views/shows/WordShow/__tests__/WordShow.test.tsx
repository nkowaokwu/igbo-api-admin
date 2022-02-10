// Guide on mocking dataProvider
// https://github.com/marmelab/react-admin/pull/6753/files
import React from 'react';
import { render } from '@testing-library/react';
import { TestContext } from 'ra-test';
import { DataProviderContext } from 'react-admin';
import Collections from 'src/shared/constants/Collections';
import WordClass from 'src/shared/constants/WordClass';
import WordShow from '../WordShow';

beforeEach(() => {
  document.getElementsByTagName('html')[0].innerHTML = '';
});

const record = {
  id: 123,
  word: 'testing word',
  definitions: [
    'first definition',
  ],
  wordClass: WordClass.ADJ.value,
};

it('render all fields for words', async () => {
  const dataProvider = {
    getOne: () => Promise.resolve({
      data: record,
    }),
  };
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
  const dataProvider = {
    getOne: () => Promise.resolve({
      data: record,
    }),
  };
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
