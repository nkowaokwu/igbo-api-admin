import React, { useState, ReactElement, Suspense } from 'react';
import { Box, Button, Heading, Hide, Show, Text, useDisclosure } from '@chakra-ui/react';
import moment from 'moment';
import LoginStats from 'src/Login/components/LoginStats';
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
      <Hide below="lg">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          flex={1}
          backgroundColor="#417453"
          // eslint-disable-next-line max-len
          backgroundImage="url('https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/pattern.png')"
          backgroundSize="82px 44px"
          height="full"
          padding={12}
        >
          <Heading as="h1" fontFamily="Silka" color="white" fontSize="2xl">
            Igbo API Editor Platform
          </Heading>
          <Box>
            <Box className="space-y-4 w-10/12">
              <Heading as="h2" fontFamily="Silka" color="white" fontSize={{ base: '4xl', md: '6xl' }}>
                Building accessible Igbo technology for everyone.
              </Heading>
              <Text as="h3" fontFamily="Silka" color="white" fontSize="xl">
                Create an account and join our volunteers to build the largest Igbo dataset ever.
              </Text>
            </Box>
            <Box className="mt-12">
              <LoginStats className="justify-start" />
            </Box>
          </Box>
          <Text as="p" color="blue.100" fontSize="md">
            {`© ${moment().year()} Nkọwa okwu. All rights reserved.`}
          </Text>
        </Box>
      </Hide>
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
        <Box
          display="flex"
          flexDirection="column"
          justifyContent={{ base: 'space-between', md: 'center' }}
          alignItems="center"
          className="space-y-4 h-full"
          maxWidth="400px"
        >
          <Box className="space-y-4">
            <Hide above="lg">
              <Heading as="h1" fontFamily="Silka" color="gray.700" fontSize="2xl" textAlign="center">
                Igbo API Editor Platform
              </Heading>
            </Hide>
          </Box>
          <Box className="w-full space-y-2">
            <GoogleLogin setErrorMessage={setErrorMessage} userLoginState={userLoginState} />
            <FacebookLogin setErrorMessage={setErrorMessage} userLoginState={userLoginState} />
            <OrDivider />
            <Button
              width="full"
              variant="primary"
              backgroundColor="primary"
              color="white"
              data-test="open-login-modal"
              height="48px"
              onClick={handleAccount(UserLoginState.SIGN_UP)}
              mt={2}
            >
              Create an account 📞 📧
            </Button>
            {userLoginState !== UserLoginState.PASSWORD_RECOVERY ? (
              <TermsAndPrivacyMessage errorMessage={errorMessage} />
            ) : null}
          </Box>

          <AlreadyHaveAnAccount onClick={handleAccount} />
          <Show below="md">
            <Box mt={8}>
              <LoginStats theme="dark" size="sm" />
            </Box>
          </Show>
        </Box>
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
  );
};

export default Login;
