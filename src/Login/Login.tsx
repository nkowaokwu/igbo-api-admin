import React, { useState, ReactElement, Suspense } from 'react';
import { Box, Button, Heading, VStack, useDisclosure } from '@chakra-ui/react';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import GoogleLogin from 'src/Login/components/GoogleLogin';
import FacebookLogin from 'src/Login/components/FacebookLogin';
import TermsAndPrivacyMessage from 'src/Login/components/TermsAndPrivacyMessage';
import OrDivider from 'src/Login/components/OrDivider';
import AlreadyHaveAnAccount from 'src/Login/components/AlreadyHaveAnAccount';
import UserRoles from '../backend/shared/constants/UserRoles';

export interface SignupInfo {
  email: string;
  password: string;
  displayName: string;
  role: UserRoles.USER;
}

const LoginModal = React.lazy(() => import('src/Login/components/LoginModal'));

const Login = (): ReactElement => {
  const [userLoginState, setUserLoginState] = useState<UserLoginState>(UserLoginState.SIGN_UP);
  const [errorMessage, setErrorMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAccount = (loginState: UserLoginState) => () => {
    onOpen();
    setUserLoginState(loginState);
  };
  return (
    <Box display="flex" flexDirection="row" height="100vh">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent={{ base: 'start', lg: 'center ' }}
        alignItems="center"
        flex={1}
        width={{ base: '100vw', lg: 'auto' }}
        backgroundColor="white"
        height="full"
        padding={12}
      >
        <VStack width="full" gap={4} height="100vw" overflow="hidden" maxWidth="400px" justifyContent="center">
          <Heading>Igbo API Editor Platform</Heading>
          <GoogleLogin setErrorMessage={setErrorMessage} userLoginState={userLoginState} />
          <FacebookLogin setErrorMessage={setErrorMessage} userLoginState={userLoginState} />
          <OrDivider />
          <Button
            width="full"
            color="gray.500"
            data-test="open-login-modal"
            onClick={handleAccount(UserLoginState.SIGN_UP)}
            height="48px"
            backgroundColor="white"
            _hover={{
              backgroundColor: 'white',
            }}
            _active={{
              backgroundColor: 'white',
            }}
            _focus={{
              backgroundColor: 'white',
            }}
          >
            Create an account
          </Button>
          {userLoginState !== UserLoginState.PASSWORD_RECOVERY ? (
            <TermsAndPrivacyMessage errorMessage={errorMessage} />
          ) : null}
          <AlreadyHaveAnAccount onClick={handleAccount} />
        </VStack>
        <Suspense
          fallback={(() => (
            <></>
          ))()}
        >
          <LoginModal
            isOpen={isOpen}
            onClose={onClose}
            userLoginState={userLoginState}
            setUserLoginState={setUserLoginState}
            setErrorMessage={setErrorMessage}
          />
        </Suspense>
        <div id="recaptcha-container" />
      </Box>
    </Box>

    // <Heading as="h1" fontFamily="Silka" color="white" fontSize="2xl">
    //         Igbo API Editor Platform
    //       </Heading>

    //       <Text as="p" color="blue.100" fontSize="md">
    //         {`© ${moment().year()} Nkọwa okwu. All rights reserved.`}
    //       </Text>
  );
};

export default Login;
