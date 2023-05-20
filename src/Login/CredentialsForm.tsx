import React, { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Text,
  VStack,
  chakra,
} from '@chakra-ui/react';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import EmailLogin from './EmailLogin';
import GoogleLogin from './GoogleLogin';
import PasswordRecovery from './PasswordRecovery';

const CredentialsForm = (): ReactElement => {
  const [errorMessage, setErrorMessage] = useState('');
  const [userLoginState, setUserLoginState] = useState<UserLoginState>(UserLoginState.LOGIN);

  const handleAccount = () => {
    setUserLoginState(userLoginState === UserLoginState.LOGIN ? UserLoginState.SIGNUP : UserLoginState.LOGIN);
  };

  const LoginOptions = (props) => (
    <Box {...props} className="flex flex-col items-center justify-evenly w-full">
      <VStack className="w-10/12">
        <EmailLogin
          setErrorMessage={setErrorMessage}
          userLoginState={userLoginState}
          setUserLoginState={setUserLoginState}
        />
        <Button
          variant="ghost"
          color="gray.400"
          _hover={{
            backgroundColor: 'white',
            color: 'var(--chakra-colors-gray-500)',
          }}
          _active={{
            backgroundColor: 'white',
          }}
          onClick={handleAccount}
        >
          {userLoginState === UserLoginState.LOGIN
            ? (
              <Text>
                <chakra.span fontWeight="normal">New to the Igbo API Editor Platform?</chakra.span>
                <chakra.span _hover={{ color: 'primary' }}>{' Create account'}</chakra.span>
              </Text>
            ) : (
              <Text>
                <chakra.span fontWeight="normal">Already have an account?</chakra.span>
                <chakra.span _hover={{ color: 'primary' }}>{' Log into account'}</chakra.span>
              </Text>
            )}
        </Button>
        {userLoginState !== UserLoginState.PASSWORD_RECOVERY ? (
          <Box display="flex" width="full" alignItems="center" mb="4">
            <Divider />
            <Text flex="1" px={2} color="gray.400" width="full" textAlign="center">
              or
            </Text>
            <Divider />
          </Box>
        ) : null}
      </VStack>
      <GoogleLogin setErrorMessage={setErrorMessage} />
      {errorMessage ? (
        <span className="text-red-500">{errorMessage}</span>
      ) : null}
    </Box>
  );

  return (
    <>
      {userLoginState === UserLoginState.PASSWORD_RECOVERY ? (
        <PasswordRecovery flex={1} px={12} py={3} borderLeftRadius="md" />
      ) : null}
      <LoginOptions flex={1} />
    </>
  );
};

export default CredentialsForm;
