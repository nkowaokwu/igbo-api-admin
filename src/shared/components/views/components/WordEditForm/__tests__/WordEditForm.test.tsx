import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/tests/components/TestContext';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import WordEditForm from '../WordEditForm';

jest.mock('src/shared/API');
jest.mock('src/utils/getWord');

beforeEach(() => {
  document.getElementsByTagName('html')[0].innerHTML = '';
});
it('render word edit form', async () => {
  const { findByText } = render(
    <TestContext>
      <WordEditForm
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={{ id: '123' }}
        save={() => {}}
        history={{}}
      />
    </TestContext>,
  );
  await findByText('Headword');
  await findByText('Nsịbịdị');
  await findByText('Is Standard Igbo');
  await findByText('Is Accented');
  await findByText('Is Slang');
  await findByText('Is Constructed Term');
  await findByText('Definitions');
  await findByText('Word Pronunciation');
  await findByText('Spelling Variations');
  await findByText('Word Stems');
  await findByText('Synonyms');
  await findByText('Antonyms');
  await findByText('Examples');
  await findByText('Current Dialects');
  await findByText('Editor Comments');
});

it('add a word stem to word suggestion', async () => {
  const { findByText, findByPlaceholderText } = render(
    <TestContext>
      <WordEditForm
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={{ id: '123' }}
        save={() => {}}
        history={{}}
      />
    </TestContext>,
  );

  userEvent.type(await findByPlaceholderText('Search for stem or use word id'), 'cat');
  userEvent.click(await findByText('retrieved word'));
  await findByText('ADJ');
  await findByText('resolved word definition');
});

it('add a word synonym to word suggestion', async () => {
  const { findByText, findByPlaceholderText } = render(
    <TestContext>
      <WordEditForm
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={{ id: '123' }}
        save={() => {}}
        history={{}}
      />
    </TestContext>,
  );

  userEvent.type(await findByPlaceholderText('Search for synonym or use word id'), 'cat');
  userEvent.click(await findByText('retrieved word'));
  await findByText('ADJ');
  await findByText('resolved word definition');
});

it('add a word antonym to word suggestion', async () => {
  const { findByText, findByPlaceholderText } = render(
    <TestContext>
      <WordEditForm
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={{ id: '123' }}
        save={() => {}}
        history={{}}
      />
    </TestContext>,
  );

  userEvent.type(await findByPlaceholderText('Search for antonym or use word id'), 'cat');
  userEvent.click(await findByText('retrieved word'));
  await findByText('ADJ');
  await findByText('resolved word definition');
});
