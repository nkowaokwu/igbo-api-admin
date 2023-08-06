import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import { IdentifierType } from 'src/Login/components/types';
import EmailAndPhoneLogin from 'src/Login/components/EmailAndPhoneLogin';

describe('EmailAndPhoneLogin', () => {
  it('renders the email create account form', async () => {
    const setUserLoginStateMock = jest.fn();
    const setIdentifierTypeMock = jest.fn();
    const setDisplayNameMock = jest.fn();
    const setUserIdentifierMock = jest.fn();
    const setPasswordMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <EmailAndPhoneLogin
          userLoginState={UserLoginState.SIGN_UP}
          identifierType={IdentifierType.EMAIL}
          setUserLoginState={setUserLoginStateMock}
          setIdentifierType={setIdentifierTypeMock}
          setDisplayName={setDisplayNameMock}
          setUserIdentifier={setUserIdentifierMock}
          setPassword={setPasswordMock}
        />
      </TestContext>,
    );
    await findByText('Full name');
    await findByText('Email address');
    await findByText('Use phone instead');
    await findByText('Password');
  });

  it('renders the phone create account form', async () => {
    const setUserLoginStateMock = jest.fn();
    const setIdentifierTypeMock = jest.fn();
    const setDisplayNameMock = jest.fn();
    const setUserIdentifierMock = jest.fn();
    const setPasswordMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <EmailAndPhoneLogin
          userLoginState={UserLoginState.SIGN_UP}
          identifierType={IdentifierType.PHONE}
          setUserLoginState={setUserLoginStateMock}
          setIdentifierType={setIdentifierTypeMock}
          setDisplayName={setDisplayNameMock}
          setUserIdentifier={setUserIdentifierMock}
          setPassword={setPasswordMock}
        />
      </TestContext>,
    );
    await findByText('Full name');
    await findByText('Phone number');
    await findByText('Use email instead');
    await findByText('Password');
  });

  it('renders email login form', async () => {
    const setUserLoginStateMock = jest.fn();
    const setIdentifierTypeMock = jest.fn();
    const setDisplayNameMock = jest.fn();
    const setUserIdentifierMock = jest.fn();
    const setPasswordMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <EmailAndPhoneLogin
          userLoginState={UserLoginState.LOGIN}
          identifierType={IdentifierType.EMAIL}
          setUserLoginState={setUserLoginStateMock}
          setIdentifierType={setIdentifierTypeMock}
          setDisplayName={setDisplayNameMock}
          setUserIdentifier={setUserIdentifierMock}
          setPassword={setPasswordMock}
        />
      </TestContext>,
    );
    await findByText('Email address');
    await findByText('Use phone instead');
    await findByText('Password');
  });

  it('renders email login form', async () => {
    const setUserLoginStateMock = jest.fn();
    const setIdentifierTypeMock = jest.fn();
    const setDisplayNameMock = jest.fn();
    const setUserIdentifierMock = jest.fn();
    const setPasswordMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <EmailAndPhoneLogin
          userLoginState={UserLoginState.LOGIN}
          identifierType={IdentifierType.PHONE}
          setUserLoginState={setUserLoginStateMock}
          setIdentifierType={setIdentifierTypeMock}
          setDisplayName={setDisplayNameMock}
          setUserIdentifier={setUserIdentifierMock}
          setPassword={setPasswordMock}
        />
      </TestContext>,
    );
    await findByText('Phone number');
    await findByText('Use email instead');
    await findByText('Password');
  });

  it('renders password recovery', async () => {
    const setUserLoginStateMock = jest.fn();
    const setIdentifierTypeMock = jest.fn();
    const setDisplayNameMock = jest.fn();
    const setUserIdentifierMock = jest.fn();
    const setPasswordMock = jest.fn();
    const { findByText } = render(
      <TestContext>
        <EmailAndPhoneLogin
          userLoginState={UserLoginState.PASSWORD_RECOVERY}
          identifierType={IdentifierType.EMAIL}
          setUserLoginState={setUserLoginStateMock}
          setIdentifierType={setIdentifierTypeMock}
          setDisplayName={setDisplayNameMock}
          setUserIdentifier={setUserIdentifierMock}
          setPassword={setPasswordMock}
        />
      </TestContext>,
    );
    await findByText('A password reset link will be sent to your email.');
    await findByText('Email address');
    await findByText(/Please email/);
  });
});
