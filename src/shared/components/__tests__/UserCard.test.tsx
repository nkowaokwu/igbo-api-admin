import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import UserCard from '../UserCard';

jest.mock('src/shared/DataCollectionAPI');
jest.mock('src/Core/Dashboard/network');

describe('UserCard', () => {
  it('renders the input field for name when editing', async () => {
    const user = { displayName: 'First name', email: 'email@email.com', photoURL: '' };
    const { findByTestId, findByPlaceholderText } = render(
      <TestContext>
        <UserCard isEditing {...user} />
      </TestContext>,
    );

    await findByTestId('user-profile-display-name-input');
    const inputElement = (await findByPlaceholderText('Full Display Name')) as HTMLInputElement;
    expect(inputElement.value).toEqual(user.displayName);
  });
});
