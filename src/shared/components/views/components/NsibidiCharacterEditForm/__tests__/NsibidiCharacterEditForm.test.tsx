import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import WordClass from 'src/backend/shared/constants/WordClass';
import Views from 'src/shared/constants/Views';
import NsibidiCharacterEditForm from '../NsibidiCharacterEditForm';

describe('NsibidiCharacterEditForm', () => {
  it('submits form with correct data', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText, findByTestId, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}}>
        <NsibidiCharacterEditForm save={mockSave} />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Input in Nsịbịdị'), 'nsibidi');
    userEvent.type(await findByPlaceholderText('Nsịbịdị pronunciation'), 'pronunciation');
    const partOfSpeechSelect = await findByTestId('nsibidi-word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });
    userEvent.click(await findByText(WordClass.ADJ.nsibidiValue));
    userEvent.type(await findByPlaceholderText('Search for radical or use radical id'), 'gi');
    userEvent.click(await findByText('first definition'));

    fireEvent.click(await findByText('Add definition'));
    userEvent.type(await findByTestId('definitions-0-input'), 'first definition');
    userEvent.click(await findByText('Update'));
    await waitFor(() =>
      expect(mockSave).toBeCalledWith(
        {
          definitions: [{ text: 'first definition' }],
          radicals: [{ id: 'resolved-nsibidi-987' }],
          nsibidi: 'nsibidi',
          pronunciation: 'pronunciation',
          wordClass: WordClass.ADJ.nsibidiValue,
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('fails to submit from missing nsibidi', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText, findByTestId, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}} save={mockSave}>
        <NsibidiCharacterEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Nsịbịdị pronunciation'), 'pronunciation');
    const partOfSpeechSelect = await findByTestId('nsibidi-word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });
    userEvent.click(await findByText(WordClass.ADJ.nsibidiValue));

    fireEvent.click(await findByText('Add definition'));
    userEvent.type(await findByTestId('definitions-0-input'), 'first definition');
    userEvent.click(await findByText('Update'));
    expect(mockSave).not.toBeCalled();
  });

  it('fails to submit from missing pronunciation', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText, findByTestId, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}} save={mockSave}>
        <NsibidiCharacterEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Input in Nsịbịdị'), 'nsibidi');
    const partOfSpeechSelect = await findByTestId('nsibidi-word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });
    userEvent.click(await findByText(WordClass.ADJ.nsibidiValue));

    fireEvent.click(await findByText('Add definition'));
    userEvent.type(await findByTestId('definitions-0-input'), 'first definition');
    userEvent.click(await findByText('Update'));
    expect(mockSave).not.toBeCalled();
  });

  it('fails to submit from missing definition', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText, findByTestId, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}} save={mockSave}>
        <NsibidiCharacterEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Input in Nsịbịdị'), 'nsibidi');
    userEvent.type(await findByPlaceholderText('Nsịbịdị pronunciation'), 'pronunciation');
    const partOfSpeechSelect = await findByTestId('nsibidi-word-class-input-container');
    fireEvent.keyDown(partOfSpeechSelect.firstChild, { key: 'ArrowDown' });
    userEvent.click(await findByText(WordClass.ADJ.nsibidiValue));

    userEvent.click(await findByText('Update'));
    expect(mockSave).not.toBeCalled();
  });

  it('fails to submit from missing word class', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText, findByTestId, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}} save={mockSave}>
        <NsibidiCharacterEditForm />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Input in Nsịbịdị'), 'nsibidi');
    userEvent.type(await findByPlaceholderText('Nsịbịdị pronunciation'), 'pronunciation');

    fireEvent.click(await findByText('Add definition'));
    userEvent.type(await findByTestId('definitions-0-input'), 'first definition');
    userEvent.click(await findByText('Update'));
    expect(mockSave).not.toBeCalled();
  });
});
