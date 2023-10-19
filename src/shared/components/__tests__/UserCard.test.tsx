import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import UserCard from '../UserCard';

jest.mock('src/shared/DataCollectionAPI');
jest.mock('src/Core/Dashboard/network');

describe('UserCard', () => {
  it('renders the input field for name when editing', async () => {
    const user = {
      displayName: 'First name',
      email: 'email@email.com',
      photoURL: '',
      age: 18,
      dialects: [DialectEnum.ABI],
      gender: GenderEnum,
    };
    const { findByTestId, findByPlaceholderText, findByText } = render(
      <TestContext>
        <UserCard isEditing {...user} />
      </TestContext>,
    );

    await findByTestId('user-profile-display-name-input');
    await findByText('18');
    await findByText('Abịrịba');
    await findByText('Female');
    const inputElement = (await findByPlaceholderText('Full Display Name')) as HTMLInputElement;
    expect(inputElement.value).toEqual(user.displayName);
  });
});
