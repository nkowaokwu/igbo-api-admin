import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import * as FirebaseAuth from 'firebase/auth';
import TestContext from 'src/__tests__/components/TestContext';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import LoginModal from '../components/LoginModal';

describe('LoginModal', () => {
  it('renders the create account form with phone number', async () => {
    const setUserLoginStateMock = jest.fn();
    const setErrorMessageMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <LoginModal
          isOpen
          onClose={noop}
          userLoginState={UserLoginState.SIGN_UP}
          setUserLoginState={setUserLoginStateMock}
          setErrorMessage={setErrorMessageMock}
        />
      </TestContext>,
    );
    await findByText('Create an account');
    await findByText('Full name');
    await findByText('Phone number');
    await findByText('Use email instead');
    await findByText('Password');
  });

  it('fill out create account form for phone number', async () => {
    const setUserLoginStateMock = jest.fn();
    const setErrorMessageMock = jest.fn();
    console.log(FirebaseAuth.signInWithPhoneNumber);
    const { findByText, findByPlaceholderText } = render(
      <TestContext>
        <LoginModal
          isOpen
          onClose={noop}
          userLoginState={UserLoginState.SIGN_UP}
          setUserLoginState={setUserLoginStateMock}
          setErrorMessage={setErrorMessageMock}
        />
      </TestContext>,
    );
    userEvent.type(await findByPlaceholderText('Full name'), 'Full name');
    userEvent.type(await findByPlaceholderText('1 (702) 123-4567'), '15555555555');
    userEvent.type(await findByPlaceholderText('Password'), 'password');
    userEvent.click(await findByText('Next'));
  });
});
