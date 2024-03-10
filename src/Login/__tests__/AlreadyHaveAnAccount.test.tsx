import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import userEvent from '@testing-library/user-event';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import AlreadyHaveAnAccount from '../components/AlreadyHaveAnAccount';

describe('AlreadyHaveAnAccount', () => {
  it('attempts to start logging into account', async () => {
    const onClickMock = jest.fn(() => jest.fn());

    const { findByText } = render(
      <TestContext>
        <AlreadyHaveAnAccount onClick={onClickMock} />
      </TestContext>,
    );
    userEvent.click(await findByText('Log into account'));
    expect(onClickMock).toHaveBeenCalledWith(UserLoginState.LOGIN);
  });
});
