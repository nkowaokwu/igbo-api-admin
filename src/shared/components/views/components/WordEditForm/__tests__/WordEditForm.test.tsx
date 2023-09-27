import React from 'react';
import { cloneDeep, last } from 'lodash';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import Tense from 'src/backend/shared/constants/Tense';
import { wordRecord } from 'src/__tests__/__mocks__/documentData';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import WordEditForm from '../WordEditForm';

jest.mock('src/Core/Dashboard/network');

describe('Word Edit Form', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });
  it('render word edit form', async () => {
    const { findByText, findAllByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
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
    await findAllByText('Word Pronunciation');
    await findByText('Spelling Variations');
    await findByText('Word Stems');
    await findByText('Examples');
    await findByText('Dialectal Variations');
    await findByText("Editor's Comments");
  });

  it.skip('submits the word form', async () => {
    const mockSave = jest.fn();
    const { findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={mockSave}>
        <WordEditForm />
      </TestContext>,
    );
    fireEvent.submit(await findByTestId('word-edit-form'));
    expect(mockHandleSubmit).toBeCalled();
    expect(mockSave).toBeCalled();
  });

  it('render dialectal variations', async () => {
    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
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
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );

    userEvent.click(await findByText('Add Definition Group'));
    await findByText('Definition Groups (2)');
    await findAllByText('Part of Speech');
    await findAllByText('Definitions');
  });

  it.skip('add a word stem to word suggestion', async () => {
    const { findByPlaceholderText, findAllByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for stem or use word id'), 'cat');
    userEvent.click(last(await findAllByText('retrieved word')));
    await findAllByText('resolved word definition');
  });

  it('add a word relatedTerm to word suggestion', async () => {
    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for a related term or use word id'), 'cat');
    await findAllByText('retrieved word');
    await findAllByText('NNC');
    await findAllByText('first definition');
    userEvent.click(last(await findAllByText('retrieved word')));
    await findByText('ADJ');
    await findByText('resolved word definition');
  });

  it('add a word nsibidi to word suggestion', async () => {
    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm record={{ definitions: [{ nsibidi: '', nsibidiCharacters: [] }] }} />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for a related term or use word id'), 'cat');
    await findAllByText('retrieved word');
    await findAllByText('NNC');
    await findAllByText('first definition');
    userEvent.click(last(await findAllByText('retrieved word')));
    await findByText('ADJ');
    await findByText('resolved word definition');
  });

  it("doesn't show tenses with a non-verb", async () => {
    const { queryByText, findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );

    const partOfSpeechSelect = await findByTestId('word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });

    userEvent.click(await findByText('Noun'));

    expect(await queryByText('Tenses')).toBeNull();
  });

  it('shows tenses with a verb', async () => {
    const staticWordRecord = cloneDeep(wordRecord);
    staticWordRecord.definitions[0].wordClass = WordClassEnum.AV;
    const { findByText, getByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );

    await findByText('Tenses');
    Object.values(Tense).forEach(({ value }) => {
      expect(getByTestId(`tenses-${value}-input`).getAttribute('value')).toEqual('');
    });
  });

  it('switches from non-verb to verb to show tenses', async () => {
    const { findByText, findByTestId, findAllByText, getByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );
    userEvent.type(await findByTestId('word-input'), 'new headword');
    await findByTestId('audio-recording-warning-message');

    const partOfSpeechSelect = await findByTestId('word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });
    userEvent.click(last(await findAllByText('Active verb')));

    await findByText('Tenses');
    Object.values(Tense).forEach(({ value }) => {
      expect(getByTestId(`tenses-${value}-input`).getAttribute('value')).toEqual('');
    });
  });

  it('show the updated headword warning message within audio recorder', async () => {
    const { findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );
    userEvent.type(await findByTestId('word-input'), 'new headword');
    await findByTestId('audio-recording-warning-message');
  });

  it('render nsibidi options', async () => {
    const { findByTestId, findByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} save={() => {}}>
        <WordEditForm />
      </TestContext>,
    );
    userEvent.type(await findByTestId('definition-group-nsibidi-input'), 'nsibidi');
    await findByText('first definition');
  });
});
