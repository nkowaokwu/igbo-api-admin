import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Button, Divider, Heading, Text, VStack, chakra, Show, Link, SlideFade } from '@chakra-ui/react';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import LoginStats from 'src/Login/LoginStats';
import EmailLogin from './EmailLogin';
import GoogleLogin from './GoogleLogin';
import PasswordRecovery from './PasswordRecovery';

const CredentialsForm = (): ReactElement => {
  const [errorMessage, setErrorMessage] = useState('');
  const [userLoginState, setUserLoginState] = useState<UserLoginState>(UserLoginState.LOGIN);
  const [credentialHeader, setCredentialHeader] = useState('Log in to your account');

  const handleAccount = () => {
    setUserLoginState(userLoginState === UserLoginState.LOGIN ? UserLoginState.SIGN_UP : UserLoginState.LOGIN);
  };

  useEffect(() => {
    if (userLoginState === UserLoginState.SIGN_UP) {
      setCredentialHeader('Sign up for an account');
    } else if (userLoginState === UserLoginState.LOGIN) {
      setCredentialHeader('Log in to your account');
    }
  }, [userLoginState]);

  const LoginOptions = (props) => (
    <Box data-test="login-options" maxWidth="380px">
      <Heading as="h2" fontFamily="Silka" fontSize="3xl" textAlign="center" mb={4}>
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
          <SlideFade in={!!errorMessage} offsetY="-20px">
            <Text mt={2} textAlign="center" className="text-red-500">
              {errorMessage}
            </Text>
          </SlideFade>
          <Text mt={2}>
            By creating an account, you agree to our{' '}
            <Link href="https://nkowaokwu.com/terms" target="_blank" color="primary">
              Terms and Conditions
            </Link>{' '}
            and that you have read our{' '}
            <Link href="https://nkowaokwu.com/privacy" target="_blank" color="primary">
              Privacy Policy
            </Link>
            .
          </Text>
          <Show below="md">
            <Box mt={8}>
              <LoginStats theme="dark" size="sm" />
            </Box>
          </Show>
        </Box>
      </Box>
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
