// Mock save: https://stackoverflow.com/a/72472685
import React from 'react';
import { cloneDeep, first, last } from 'lodash';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import { wordRecord } from 'src/__tests__/__mocks__/documentData';
import Dialects from 'src/backend/shared/constants/Dialect';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import WordTags from 'src/backend/shared/constants/WordTags';
import WordClass from 'src/backend/shared/constants/WordClass';
import Tense from 'src/backend/shared/constants/Tense';
import WordAttributeEnum from 'src/backend/shared/constants/WordAttributeEnum';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import WordEditForm from '../WordEditForm';

describe('Submit WordEditForm', () => {
  it('submits word edit form', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(testWord, Views.SHOW, {
        onFailure: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('fails to submit word edit form', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );
    userEvent.clear(await findByTestId('word-input'));
    fireEvent.submit(await findByText('Update'));
    await findByText('Word is required');

    await waitFor(() => expect(mockSave).not.toBeCalled());
  });

  it('submits word edit for with audio pronunciations approvals, denials, and review', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;
    testWord.examples[0].pronunciations[0] = {
      audio: 'recording',
      speaker: '',
      // @ts-expect-error
      review: false,
      denials: [],
      approvals: [],
    };

    const { findByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} record={testWord}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.submit(await findByText('Update'));

    const finalWord = cloneDeep(testWord);
    finalWord.examples[0].pronunciations[0] = {
      audio: 'recording',
      speaker: '',
    };
    await waitFor(() =>
      expect(mockSave).toBeCalledWith(finalWord, Views.SHOW, {
        onFailure: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('submits word edit form with an extra example sentence', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    testWord.examples.push({
      igbo: 'second igbo example',
      english: 'second english example',
      nsibidi: 'second nsibidi example',
      meaning: 'second meaning example',
      associatedWords: [],
      nsibidiCharacters: [],
      pronunciations: [],
    });

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.click(await findByText('Add Example'));
    userEvent.type(await findByTestId('examples-1-igbo-input'), 'second igbo example');
    userEvent.type(await findByTestId('examples-1-english-input'), 'second english example');
    userEvent.type(await findByTestId('examples-1-meaning-input'), 'second meaning example');
    userEvent.type(await findByTestId('examples-1-nsibidi-input'), 'second nsibidi example');
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(testWord, Views.SHOW, {
        onFailure: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('submits word edit form with example without omitting its id', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    testWord.examples[0] = {
      ...testWord.examples[0],
      id: 'example-id',
    };

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Example'));
    userEvent.type(await findByTestId('examples-1-igbo-input'), 'second igbo example');
    userEvent.type(await findByTestId('examples-1-english-input'), 'second english example');
    userEvent.type(await findByTestId('examples-1-meaning-input'), 'second meaning example');
    userEvent.type(await findByTestId('examples-1-nsibidi-input'), 'second nsibidi example');

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          examples: [
            ...testWord.examples,
            {
              igbo: 'second igbo example',
              english: 'second english example',
              nsibidi: 'second nsibidi example',
              meaning: 'second meaning example',
              associatedWords: [],
              nsibidiCharacters: [],
              pronunciations: [],
            },
          ],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with example without overwriting first audio', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    testWord.examples[0] = {
      ...testWord.examples[0],
      id: 'example-id',
      pronunciations: [
        { audio: 'first-audio-pronunciation', speaker: '' },
        { audio: 'second-audio-pronunciation', speaker: '' },
      ],
    };

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS} record={testWord}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    userEvent.clear(await findByTestId('examples-0-igbo-input'));
    userEvent.type(await findByTestId('examples-0-igbo-input'), 'first igbo example');
    userEvent.clear(await findByTestId('examples-0-english-input'));
    userEvent.type(await findByTestId('examples-0-english-input'), 'first english example');
    userEvent.type(await findByTestId('examples-0-meaning-input'), 'first meaning example');
    userEvent.type(await findByTestId('examples-0-nsibidi-input'), 'first nsibidi example');

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          examples: [
            {
              ...testWord.examples[0],
              igbo: 'first igbo example',
              english: 'first english example',
              nsibidi: 'first nsibidi example',
              meaning: 'first meaning example',
              pronunciations: [
                { audio: 'first-audio-pronunciation', speaker: '' },
                { audio: 'second-audio-pronunciation', speaker: '' },
              ],
            },
          ],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with adding a dialectal variation', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Dialectal Variation'));
    const dialectsSelect = await findByTestId('dialects-input-container-1');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(Dialects.AJA.label));

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          dialects: [...testWord.dialects, { dialects: ['AJA'], pronunciation: '', word: 'New dialectal variation' }],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with all headword attributes selected', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, getByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    Object.values(WordAttributes).forEach(({ value }) => {
      if (value !== WordAttributeEnum.IS_COMPLETE && value !== WordAttributeEnum.IS_COMMON) {
        fireEvent.click(getByTestId(`${value}-checkbox`).firstChild);
      }
    });

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          attributes: Object.values(WordAttributes).reduce((attributes, { value }) => {
            if (value !== WordAttributeEnum.IS_COMPLETE && value !== WordAttributeEnum.IS_COMMON) {
              attributes[value] = true;
            }
            return attributes;
          }, {}),
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with a selected tag', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    const dialectsSelect = await findByTestId('tags-input-container');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(WordTags.BOTANY.label));
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          tags: [WordTags.BOTANY.value],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with an updated headword', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    userEvent.clear(await findByTestId('word-input'));
    userEvent.type(await findByTestId('word-input'), 'updated word');
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          word: 'updated word',
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with an updated definition group', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId, findAllByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    const dialectsSelect = await findByTestId('word-class-input-container');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(WordClass.CJN.label));
    userEvent.clear(first(await findAllByTestId('definition-group-nsibidi-input')));
    userEvent.type(first(await findAllByTestId('definition-group-nsibidi-input')), 'nsibidi input');
    userEvent.clear(await findByTestId('nested-definitions-definitions[0].definitions[0]'));
    userEvent.type(await findByTestId('nested-definitions-definitions[0].definitions[0]'), 'first definition');
    fireEvent.click(await findByText('Add Igbo Definition'));
    userEvent.type(
      await findByTestId('nested-definitions-definitions[0].igboDefinitions[0].igbo'),
      'first igbo definition',
    );

    userEvent.type(last(await findAllByTestId('definition-group-nsibidi-input')), 'igbo definition nsibidi');

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          definitions: [
            {
              ...testWord.definitions[0],
              definitions: ['first definition'],
              igboDefinitions: [{ igbo: 'first igbo definition', nsibidi: 'igbo definition nsibidi' }],
              wordClass: WordClassEnum.CJN,
              nsibidi: 'nsibidi input',
            },
          ],
          tenses: Object.values(Tense).reduce((tenses, { value }) => ({ ...tenses, [value]: undefined }), {}),
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with deleting first definition group and updating the only one left', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId, findAllByText, findAllByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Definition Group'));
    const dialectsSelect = last(await findAllByTestId('word-class-input-container'));
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(WordClass.ADV.label));
    userEvent.type(last(await findAllByTestId('definition-group-nsibidi-input')), 'second nsibidi input');
    fireEvent.click(last(await findAllByText('Add English Definition')));
    userEvent.type(await findByTestId('nested-definitions-definitions[1].definitions[0]'), 'second english definition');
    fireEvent.click(last(await findAllByText('Add Igbo Definition')));
    userEvent.type(
      await findByTestId('nested-definitions-definitions[1].igboDefinitions[0].igbo'),
      'second igbo definition',
    );
    fireEvent.click(first(await findAllByText('Delete Definition Group')));

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          definitions: [
            {
              ...testWord.definitions[0],
              definitions: ['second english definition'],
              igboDefinitions: [{ igbo: 'second igbo definition', nsibidi: '' }],
              wordClass: WordClassEnum.ADV,
              nsibidi: 'second nsibidi input',
            },
          ],
          tenses: Object.values(Tense).reduce((tenses, { value }) => ({ ...tenses, [value]: undefined }), {}),
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with filled in verb tenses', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId, getByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    const dialectsSelect = await findByTestId('word-class-input-container');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(WordClass.PV.label));

    Object.values(Tense).forEach(({ value }) => {
      userEvent.type(getByTestId(`tenses-${value}-input`), value);
    });

    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          definitions: [{ ...testWord.definitions[0], wordClass: WordClassEnum.PV }],
          tenses: Object.values(Tense).reduce((tenses, { value }) => ({ ...tenses, [value]: value }), {}),
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with adding variations', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add Variation'));
    userEvent.type(await findByTestId('variation-0-input'), 'first spelling variation');
    fireEvent.click(await findByText('Add Variation'));
    userEvent.type(await findByTestId('variation-1-input'), 'second spelling variation');
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          variations: ['first spelling variation', 'second spelling variation'],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with adding related terms', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for a related term or use word id'), 'word');
    await findAllByText('retrieved word');
    await findAllByText('NNC');
    await findAllByText('first definition');
    userEvent.click(last(await findAllByText('retrieved word')));
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          relatedTerms: ['567'],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits word edit form with adding related terms', async () => {
    const mockSave = jest.fn();
    const testWord = cloneDeep(wordRecord);
    delete testWord.id;
    delete testWord.dialects[0].id;

    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext view={Views.EDIT} resource={Collections.WORD_SUGGESTIONS}>
        <WordEditForm save={mockSave} />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Search for stem or use word id'), 'word');
    await findAllByText('retrieved word');
    await findAllByText('NNC');
    await findAllByText('first definition');
    userEvent.click(last(await findAllByText('retrieved word')));
    fireEvent.submit(await findByText('Update'));

    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          ...testWord,
          stems: ['567'],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });
});
