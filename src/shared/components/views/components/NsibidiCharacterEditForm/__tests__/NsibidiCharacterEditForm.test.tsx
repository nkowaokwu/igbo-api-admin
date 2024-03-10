import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import NsibidiCharacterEditForm from '../NsibidiCharacterEditForm';

describe('NsibidiCharacterEditForm', () => {
  it('submits form with correct data', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText, findByPlaceholderText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}}>
        <NsibidiCharacterEditForm save={mockSave} />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Input in Nsịbịdị'), 'nsibidi');
    userEvent.type(await findByPlaceholderText('Search for radical or use radical id'), 'gi');

    userEvent.click(await findByText('nsibidi'));
    userEvent.click(await findByText('first definition'));

    userEvent.click(await findByText('Update'));
    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(
        {
          radicals: [{ id: 'resolved-nsibidi-987' }],
          nsibidi: 'nsibidi',
          attributes: {
            [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: undefined,
            [NsibidiCharacterAttributeEnum.IS_COMPOUND]: undefined,
            [NsibidiCharacterAttributeEnum.IS_NEW]: undefined,
            [NsibidiCharacterAttributeEnum.IS_SIMPLIFIED]: undefined,
            [NsibidiCharacterAttributeEnum.IS_RADICAL]: undefined,
          },
        },
        Views.SHOW,
        { onFailure: expect.any(Function), onSuccess: expect.any(Function) },
      ),
    );
  });

  it('fails to submit from missing nsibidi', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}} save={mockSave}>
        <NsibidiCharacterEditForm />
      </TestContext>,
    );

    userEvent.click(await findByText('Update'));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('renders the has legacy characters attribute', async () => {
    const mockSave = jest.fn(() => null);

    const { findByText } = render(
      <TestContext resource={Collections.NSIBIDI_CHARACTERS} record={{}} save={mockSave}>
        <NsibidiCharacterEditForm />
      </TestContext>,
    );

    await findByText('Has Legacy Characters');
  });
});
