import React, { ReactElement } from 'react';
import { Box, ModalHeader } from '@chakra-ui/react';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';

const ProgressHeader = ({ userLoginState }: { userLoginState: UserLoginState }): ReactElement => (
  <Box className="w-full">
    <ModalHeader fontFamily="Silka">
      {userLoginState === UserLoginState.SIGN_UP
        ? 'Create an account'
        : userLoginState === UserLoginState.LOGIN
        ? 'Log into account'
        : userLoginState === UserLoginState.CONFIRM_NUMBER
        ? 'Confirm phone number'
        : userLoginState === UserLoginState.PASSWORD_RECOVERY
        ? 'Recover account password'
        : null}
    </ModalHeader>
  </Box>
);

export default ProgressHeader;
