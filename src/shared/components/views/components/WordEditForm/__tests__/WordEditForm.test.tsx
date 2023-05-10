import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import WordEditForm from '../WordEditForm';

jest.mock('src/Core/Dashboard/network');

describe('Word Edit', () => {
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
    await findByText('Definition Groups (1)');
    await findByText('Add English Definition');
    await findByText('Add Igbo Definition');
    await findByText('Word Pronunciation');
    await findByText('Spelling Variations');
    await findByText('Word Stems');
    await findByText('Examples');
    await findByText('Dialectal Variations');
    await findByText('Editor\'s Comments');
  });

  it('render dialectal variations', async () => {
    const { findByText, findByTestId } = render(
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
    await findByText('Dialectal Variations');
    userEvent.click(await findByText('Add Dialectal Variation'));
    await findByTestId('dialects-0-word-input');
    userEvent.click(await findByText('Add Dialectal Variation'));
    await findByTestId('dialects-1-word-input');
  });

  it('add a definition group to word suggestion', async () => {
    const { findByText, findAllByText } = render(
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

    userEvent.click(await findByText('Add Definition Group'));
    await findByText('Definition Groups (2)');
    await findAllByText('Part of Speech');
    await findAllByText('Definitions');
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

  it('add a word relatedTerm to word suggestion', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext>
        <WordEditForm
          view={Views.EDIT}
          resource={Collections.WORD_SUGGESTIONS}
          record={{ id: '123', definitions: [{ wordClass: 'NNC', definitions: [] }] }}
          save={() => {}}
          history={{}}
        />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for a related term or use word id'), 'cat');
    userEvent.click(await findByText('retrieved word'));
    await findByText('ADJ');
    await findByText('resolved word definition');
  });

  it('show the updated headword warning message within audio recorder', async () => {
    const { findByTestId } = render(
      <TestContext>
        <WordEditForm
          view={Views.EDIT}
          resource={Collections.WORD_SUGGESTIONS}
          record={{ id: '123', definitions: [{ wordClass: 'NNC', definitions: [] }] }}
          save={() => {}}
          history={{}}
        />
      </TestContext>,
    );
    userEvent.type(await findByTestId('word-input'), 'new headword');
    await findByTestId('audio-recording-warning-message');
  });

  it('render nsibidi options', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <WordEditForm
          view={Views.EDIT}
          resource={Collections.WORD_SUGGESTIONS}
          record={{ id: '123', definitions: [{ wordClass: 'NNC', definitions: [] }] }}
          save={() => {}}
          history={{}}
        />
      </TestContext>,
    );
    userEvent.type(await findByTestId('nsibidi-input'), 'nsibidi');
    await findByText('first definition');
    await findByText('first pronunciation');
  });
});
