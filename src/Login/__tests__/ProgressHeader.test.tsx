import React from 'react';
import { render } from '@testing-library/react';
import { Modal } from '@chakra-ui/react';
import TestContext from 'src/__tests__/components/TestContext';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import ProgressHeader from '../components/ProgressHeader';

describe('ProgressHeader', () => {
  const UserLoginMessages = {
    [UserLoginState.SIGN_UP]: 'Create an account',
    [UserLoginState.LOGIN]: 'Log into account',
    [UserLoginState.CONFIRM_NUMBER]: 'Confirm phone number',
    [UserLoginState.PASSWORD_RECOVERY]: 'Recover account password',
  };
  Object.values([
    UserLoginState.SIGN_UP,
    UserLoginState.LOGIN,
    UserLoginState.CONFIRM_NUMBER,
    UserLoginState.PASSWORD_RECOVERY,
  ]).forEach((userLoginState) => {
    it(`renders the message for user login state: ${userLoginState}`, async () => {
      const { findByText } = render(
        <TestContext>
          <Modal isOpen>
            <ProgressHeader userLoginState={userLoginState} />
          </Modal>
        </TestContext>,
      );
      await findByText(UserLoginMessages[userLoginState]);
    });
  });
});
