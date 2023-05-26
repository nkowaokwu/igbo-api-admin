import React from 'react';
import { cloneDeep, last } from 'lodash';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import { wordRecord } from 'src/__tests__/__mocks__/documentData';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import ExampleEditForm from '../ExampleEditForm';

describe('Submit ExampleEditForm', () => {
  it('submits example edit form', async () => {
    const mockSave = jest.fn();
    const testExample = cloneDeep(wordRecord.examples[0]);
    delete testExample.id;
    testExample.associatedDefinitionsSchemas = [];
    testExample.editorsNotes = '';

    const { findByText } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={wordRecord.examples[0]}
      >
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.submit(await findByText('Update'));

    await waitFor(() => expect(mockSave).toBeCalledWith(
      testExample,
      Views.SHOW,
      { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
    ));
  });

  it('submits example edit form with approvals, denials, and review', async () => {
    const mockSave = jest.fn();
    const testExample = cloneDeep(wordRecord.examples[0]);
    delete testExample.id;
    testExample.associatedDefinitionsSchemas = [];
    testExample.editorsNotes = '';
    testExample.pronunciations[0] = {
      audio: '',
      speaker: '',
      // @ts-expect-error
      review: false,
      approvals: [],
      denials: [],
    };

    const { findByText } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={testExample}
      >
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.submit(await findByText('Update'));

    const finalExample = cloneDeep(testExample);
    finalExample.pronunciations[0] = { audio: '', speaker: '' };
    await waitFor(() => expect(mockSave).toBeCalledWith(
      finalExample,
      Views.SHOW,
      { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
    ));
  });

  it('submits example edit form with multiple audio pronunciations', async () => {
    const mockSave = jest.fn();
    const testExample = cloneDeep(wordRecord.examples[0]);
    delete testExample.id;
    testExample.associatedDefinitionsSchemas = [];
    testExample.editorsNotes = '';

    const { findByText } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={wordRecord.examples[0]}
      >
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.click(await findByText('Add Audio Pronunciation'));
    fireEvent.click(await findByText('Add Audio Pronunciation'));
    fireEvent.submit(await findByText('Update'));

    await waitFor(() => expect(mockSave).toBeCalledWith(
      {
        ...testExample,
        pronunciations: [
          { audio: undefined, speaker: undefined },
          { audio: undefined, speaker: undefined },
        ],
      },
      Views.SHOW,
      { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
    ));
  });

  it('submits with updated igbo, english, meaning, and nsibidi', async () => {
    const mockSave = jest.fn();
    const testExample = cloneDeep(wordRecord.examples[0]);
    delete testExample.id;
    testExample.associatedDefinitionsSchemas = [];
    testExample.editorsNotes = '';

    const { findByText, findByTestId } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={wordRecord.examples[0]}
      >
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    userEvent.clear(await findByTestId('igbo-input'));
    userEvent.type(await findByTestId('igbo-input'), 'first igbo');
    userEvent.clear(await findByTestId('english-input'));
    userEvent.type(await findByTestId('english-input'), 'first english');
    userEvent.clear(await findByTestId('meaning-input'));
    userEvent.type(await findByTestId('meaning-input'), 'first meaning');
    userEvent.clear(await findByTestId('definition-group-nsibidi-input'));
    userEvent.type(await findByTestId('definition-group-nsibidi-input'), 'first nsibidi');
    fireEvent.submit(await findByText('Update'));

    await waitFor(() => expect(mockSave).toBeCalledWith(
      {
        ...testExample,
        igbo: 'first igbo',
        english: 'first english',
        meaning: 'first meaning',
        nsibidi: 'first nsibidi',
      },
      Views.SHOW,
      { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
    ));
  });

  it('submits with updated style', async () => {
    const mockSave = jest.fn();
    const testExample = cloneDeep(wordRecord.examples[0]);
    delete testExample.id;
    testExample.associatedDefinitionsSchemas = [];
    testExample.editorsNotes = '';

    const { findByText, findByTestId } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={wordRecord.examples[0]}
      >
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    const dialectsSelect = await findByTestId('sentence-style-input-container');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(ExampleStyle.PROVERB.label));
    fireEvent.submit(await findByText('Update'));

    await waitFor(() => expect(mockSave).toBeCalledWith(
      {
        ...testExample,
        style: ExampleStyle.PROVERB.value,
      },
      Views.SHOW,
      { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
    ));
  });

  it('submits with an added associatedWord', async () => {
    const mockSave = jest.fn();
    const testExample = cloneDeep(wordRecord.examples[0]);
    delete testExample.id;
    testExample.associatedDefinitionsSchemas = [];
    testExample.editorsNotes = '';

    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext
        view={Views.EDIT}
        resource={Collections.WORD_SUGGESTIONS}
        record={wordRecord.examples[0]}
      >
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    userEvent.type(await findByPlaceholderText('Search for associated word or use word id'), 'word');
    userEvent.click(last(await findAllByText('retrieved word')));
    await findAllByText('resolved word');
    await findAllByText('ADJ');
    await findAllByText('resolved word definition');
    fireEvent.submit(await findByText('Update'));

    await waitFor(() => expect(mockSave).toBeCalledWith(
      {
        ...testExample,
        associatedWords: ['567'],
      },
      Views.SHOW,
      { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
    ));
  });
});
