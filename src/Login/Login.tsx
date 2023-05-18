import React, { ReactElement, useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { useRedirect } from 'react-admin';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
  Box,
  Heading,
  Hide,
  Text,
  ToastId,
  useToast,
} from '@chakra-ui/react';
import moment from 'moment';
import {
  hasTranscriberPermissions,
  hasAccessToPlatformPermissions,
  hasCrowdsourcerPermission,
} from 'src/shared/utils/permissions';
import authProvider from '../utils/authProvider';
import { useCallable } from '../hooks/useCallable';
import { EmptyResponse } from '../shared/server-validation';
import LocalStorageKeys from '../shared/constants/LocalStorageKeys';
import UserRoles from '../backend/shared/constants/UserRoles';
import { FirebaseUser } from '../backend/controllers/utils/interfaces';

export interface SignupInfo {
  email: string,
  password: string,
  displayName: string,
  role: UserRoles.USER,
}

const auth = getAuth();
const Login = (): ReactElement => {
  const [, setErrorUponSubmitting] = useState(null);
  const handleCreateUserAccount = useCallable<any, EmptyResponse>('createUserAccount');
  const redirect = useRedirect();
  const toast = useToast();

  const handleRedirect = async (user: FirebaseUser): Promise<ToastId | null> => {
    const idTokenResult = await user.getIdTokenResult(true);
    const userRole = idTokenResult.claims.role as UserRoles;
    const { token, claims: { user_id: userId } } = idTokenResult;
    const permissions = { role: userRole };
    const hasPermission = hasAccessToPlatformPermissions(permissions, true);
    if (!hasPermission) {
      authProvider.logout();
      setErrorUponSubmitting('You do not have permission to access the platform');
      return toast({
        title: 'Insufficient permissions',
        description: 'You\'re account doesn\'t have the necessary permissions to access the platform.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    }
    localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, token);
    localStorage.setItem(LocalStorageKeys.UID, userId as string);
    localStorage.setItem(LocalStorageKeys.PERMISSIONS, userRole);
    const rawRedirectUrl = localStorage.getItem(LocalStorageKeys.REDIRECT_URL);
    const redirectUrl = (
      hasTranscriberPermissions(permissions, '/igboSoundbox')
      || hasCrowdsourcerPermission(permissions, '/')
      || (rawRedirectUrl || '#/').replace('#/', '') || '/'
    );
    redirect(redirectUrl);
    return null;
  };

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '#/',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      FacebookAuthProvider.PROVIDER_ID,
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        signInMethod: EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        requireDisplayName: true,
      },
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: async (user) => {
        if (user.additionalUserInfo.isNewUser) {
          handleCreateUserAccount(user.user.toJSON())
            .then(() => handleRedirect(user.user));
        } else {
          handleRedirect(user.user);
        }
        return false;
      },
      signInFailure: ({ message }) => setErrorUponSubmitting(message),
    },
  };
  return (
    <Box
      display="flex"
      flexDirection="row"
      height="100vh"
    >
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
          <Heading as="h1" fontFamily="Silka" color="white" fontSize="2xl">Igbo API Editor Platform</Heading>
          <Box className="space-y-4 w-10/12">
            <Heading as="h2" fontFamily="Silka" color="white" fontSize={{ base: '4xl', md: '6xl' }}>
              Building accessible Igbo technology for everyone.
            </Heading>
            <Text as="h3" fontFamily="Silka" color="white" fontSize="xl">
              Create an account and join 200+ volunteers to build the largest Igbo dataset ever.
            </Text>
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
          justifyContent="center"
          className="space-y-4"
        >
          <Hide above="lg">
            <Heading as="h1" fontFamily="Silka" color="gray.700" fontSize="2xl" textAlign="center">
              Igbo API Editor Platform
            </Heading>
          </Hide>
          <Heading as="h2" fontFamily="Silka" fontSize="3xl" textAlign="center">Log in to your account</Heading>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
