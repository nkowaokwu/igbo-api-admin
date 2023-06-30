import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Button, Divider, Heading, Text, VStack, chakra } from '@chakra-ui/react';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import EmailLogin from './EmailLogin';
import GoogleLogin from './GoogleLogin';
import PasswordRecovery from './PasswordRecovery';

const CredentialsForm = (): ReactElement => {
  const [errorMessage, setErrorMessage] = useState('');
  const [userLoginState, setUserLoginState] = useState<UserLoginState>(UserLoginState.LOGIN);
  const [credentialHeader, setCredentialHeader] = useState('Log in to your account');

  const handleAccount = () => {
    setUserLoginState(userLoginState === UserLoginState.LOGIN ? UserLoginState.SIGNUP : UserLoginState.LOGIN);
  };

  useEffect(() => {
    if (userLoginState === UserLoginState.SIGNUP) {
      setCredentialHeader('Sign up for an account');
    } else if (userLoginState === UserLoginState.LOGIN) {
      setCredentialHeader('Log in to your account');
    }
  }, [userLoginState]);

  const LoginOptions = (props) => (
    <>
      <Heading as="h2" fontFamily="Silka" fontSize="3xl" textAlign="center">
        {credentialHeader}
      </Heading>
      <Box {...props} className="flex flex-col items-center justify-evenly w-full">
        <Box className="w-full">
          <VStack>
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
              data-test="login-switch-button"
              onClick={handleAccount}
            >
              {userLoginState === UserLoginState.LOGIN ? (
                <Text>
                  <chakra.span fontWeight="normal">Don&apos;t have an account?</chakra.span>
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
            <Text mt={2} textAlign="center" className="text-red-500">
              {errorMessage}
            </Text>
          ) : null}
        </Box>
      </Box>
    </>
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
