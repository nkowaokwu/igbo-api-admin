import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import NsibidiCharacterCreate from '../NsibidiCharacterCreate';

describe('NsibidiCharacterCreate', () => {
  it('renders the create form', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS}>
        <NsibidiCharacterCreate record={{}} />
      </TestContext>,
    );

    await findByText('Create New Nsịbịdị Character');
    await findByText('Nsịbịdị');
    await findByPlaceholderText('Input in Nsịbịdị');
    await findByText('Pronunciation');
    await findByPlaceholderText('Nsịbịdị pronunciation');
    await findByText('Part of Speech');
    await findByText('Definitions');
    await findByText('Add definition');
    await findByText('Cancel');
    const submitButton = await findByText('Submit');
    expect(submitButton.disabled).toBe(true);
  });

  it('adds a new definition', async () => {
    const { findByText, findByTestId } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS}>
        <NsibidiCharacterCreate record={{}} />
      </TestContext>,
    );

    fireEvent.click(await findByText('Add definition'));
    userEvent.type(await findByTestId('definitions-0-input'), 'first definition');
    const submitButton = await findByText('Submit');
    expect(submitButton.disabled).toBe(false);
  });
});
