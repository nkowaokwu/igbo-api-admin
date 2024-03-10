import React from 'react';
import { cloneDeep, last } from 'lodash';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import { exampleSuggestionFixture, pronunciationFixture } from 'src/__tests__/shared/fixtures';
import { exampleSuggestionData } from 'src/__tests__/__mocks__/documentData';
import ExampleEditForm from '../ExampleEditForm';

describe('Submit ExampleEditForm', () => {
  it('submits basic example edit form', async () => {
    const mockSave = jest.fn();
    const testExample = exampleSuggestionFixture(exampleSuggestionData);
    const { findByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.EXAMPLE_SUGGESTIONS} record={testExample}>
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.submit(await findByText('Update'));
    const finalExample = cloneDeep(testExample);
    delete finalExample.createdAt;
    delete finalExample.crowdsourcing;
    delete finalExample.id;
    delete finalExample.source;
    delete finalExample.type;
    delete finalExample.updatedAt;

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith({ ...finalExample, style: undefined }, Views.SHOW, {
        onFailure: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it.skip('submits example edit form with approvals, denials, and review', async () => {
    const mockSave = jest.fn();
    const testExample = exampleSuggestionFixture({
      ...exampleSuggestionData,
      pronunciations: [pronunciationFixture()],
    });

    const { findByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.EXAMPLE_SUGGESTIONS} record={testExample}>
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.submit(await findByText('Update'));

    const finalExample = cloneDeep(testExample);
    finalExample.pronunciations[0] = { audio: '', speaker: '' };
    delete finalExample.createdAt;
    delete finalExample.crowdsourcing;
    delete finalExample.id;
    delete finalExample.source;
    delete finalExample.type;
    delete finalExample.updatedAt;

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(finalExample, Views.SHOW, {
        onFailure: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it.skip('submits example edit form with multiple audio pronunciations', async () => {
    const mockSave = jest.fn();
    const testExample = exampleSuggestionFixture(exampleSuggestionData);

    const { findByText } = render(
      <TestContext view={Views.EDIT} resource={Collections.EXAMPLE_SUGGESTIONS} record={testExample}>
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    fireEvent.click(await findByText('Add Audio Pronunciation'));
    fireEvent.click(await findByText('Add Audio Pronunciation'));
    fireEvent.submit(await findByText('Update'));

    const finalExample = cloneDeep(testExample);
    delete finalExample.createdAt;
    delete finalExample.crowdsourcing;
    delete finalExample.id;
    delete finalExample.source;
    delete finalExample.type;
    delete finalExample.updatedAt;

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(
        {
          ...finalExample,
          pronunciations: [
            { audio: undefined, speaker: undefined },
            { audio: undefined, speaker: undefined },
          ],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits with updated igbo, english, meaning, and nsibidi', async () => {
    const mockSave = jest.fn();
    const testExample = exampleSuggestionFixture(exampleSuggestionData);

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.EXAMPLE_SUGGESTIONS} record={testExample}>
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

    const finalExample = cloneDeep(testExample);
    delete finalExample.createdAt;
    delete finalExample.crowdsourcing;
    delete finalExample.id;
    delete finalExample.source;
    delete finalExample.type;
    delete finalExample.updatedAt;

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(
        {
          ...finalExample,
          igbo: 'first igbo',
          english: 'first english',
          meaning: 'first meaning',
          nsibidi: 'first nsibidi',
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits with updated style', async () => {
    const mockSave = jest.fn();
    const testExample = exampleSuggestionFixture(exampleSuggestionData);

    const { findByText, findByTestId } = render(
      <TestContext view={Views.EDIT} resource={Collections.EXAMPLE_SUGGESTIONS} record={testExample}>
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    const dialectsSelect = await findByTestId('sentence-style-input-container');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(ExampleStyle[ExampleStyleEnum.PROVERB].label));
    fireEvent.submit(await findByText('Update'));

    const finalExample = cloneDeep(testExample);
    delete finalExample.createdAt;
    delete finalExample.crowdsourcing;
    delete finalExample.id;
    delete finalExample.source;
    delete finalExample.type;
    delete finalExample.updatedAt;

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(
        {
          ...finalExample,
          style: ExampleStyle[ExampleStyleEnum.PROVERB].value,
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('submits with an added associatedWord', async () => {
    const mockSave = jest.fn();
    const testExample = exampleSuggestionFixture(exampleSuggestionData);

    const { findByText, findAllByText, findByPlaceholderText } = render(
      <TestContext view={Views.EDIT} resource={Collections.EXAMPLE_SUGGESTIONS} record={testExample}>
        <ExampleEditForm save={mockSave} />
      </TestContext>,
    );
    userEvent.type(await findByPlaceholderText('Search for associated word or use word id'), 'word');
    userEvent.click(last(await findAllByText('retrieved word')));
    await findAllByText('resolved word');
    await findAllByText('ADJ');
    await findAllByText('resolved word definition');
    fireEvent.submit(await findByText('Update'));

    const finalExample = cloneDeep(testExample);
    delete finalExample.createdAt;
    delete finalExample.crowdsourcing;
    delete finalExample.id;
    delete finalExample.source;
    delete finalExample.type;
    delete finalExample.updatedAt;

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(
        {
          ...finalExample,
          associatedWords: ['567'],
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });
});
