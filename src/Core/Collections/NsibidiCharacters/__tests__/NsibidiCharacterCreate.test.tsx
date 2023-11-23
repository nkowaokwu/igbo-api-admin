import React from 'react';
import { render } from '@testing-library/react';
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
    await findByText('Cancel');
    const submitButton = await findByText('Submit');
    expect(submitButton.disabled).toBe(true);
  });
});
