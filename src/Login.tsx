import React, { ReactElement, useState, useEffect } from 'react';
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useCallable } from './hooks/useCallable';
import { EmptyResponse } from './shared/server-validation';
import LocalStorageKeys from './shared/constants/LocalStorageKeys';
import { Role } from './shared/constants/auth-types';

export interface SignupInfo {
  email: string,
  password: string,
  displayName: string,
  role: Role.USER,
}

const Login = (): ReactElement => {
  const [successfulCreateAccount, setSuccessfulCreateAccount] = useState(null);
  const [errorUponSubmitting, setErrorUponSubmitting] = useState(null);
  const handleCreateUserAccount = useCallable<any, EmptyResponse>('createUserAccount');
  const filledAuthForm = successfulCreateAccount || errorUponSubmitting;

  const handleRedirect = async (user) => {
    const idTokenResult = await user.getIdTokenResult();
    const userRole = idTokenResult.claims.role;
    const hasPermission = userRole === Role.ADMIN || userRole === Role.MERGER || userRole === Role.EDITOR;
    if (!hasPermission) {
      firebase.auth().signOut();
      window.localStorage.clear();
      setErrorUponSubmitting('You do not have permission to access the platform');
    }
    localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, idTokenResult.token);
    localStorage.setItem(LocalStorageKeys.UID, idTokenResult.claims.user_id);
    localStorage.setItem(LocalStorageKeys.PERMISSIONS, idTokenResult.claims.role);
    const redirectUrl = localStorage.getItem(LocalStorageKeys.REDIRECT_URL);
    localStorage.removeItem(LocalStorageKeys.REDIRECT_URL);
    window.location.hash = redirectUrl || '#/';
  };

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '#/',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        requireDisplayName: true,
      },
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (user) => {
        if (user.additionalUserInfo.isNewUser) {
          handleCreateUserAccount(user.user.toJSON());
          firebase.auth().signOut();
          localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
          localStorage.removeItem(LocalStorageKeys.UID);
          localStorage.removeItem(LocalStorageKeys.PERMISSIONS);
          localStorage.removeItem(LocalStorageKeys.FORM);
          setSuccessfulCreateAccount(true);
          return false;
        }
        handleRedirect(user.user);
        return true;
      },
      signInFailure: ({ message }) => setErrorUponSubmitting(message),
    },
  };

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        return false;
      }
      await handleRedirect(user);
      return false;
    });
    return () => unregisterAuthObserver();
  }, []);

  const refreshPage = () => window.location.reload();
  return (
    <Box
      className={`flex flex-col justify-center items-center h-full
      lg:h-screen w-screen bg-gray-100 py-20 lg:py-0 overflow-hidden`}
    >
      <Heading size="xl" className="mb-6">{'Igbo API Editor\'s Platform'}</Heading>
      <Box
        className="w-11/12 lg:w-8/12 xl:w-1/2 h-auto bg-white shadow-md rounded"
        maxWidth="750px"
      >
        <Box
          className="h-full flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 lg:items-center rounded"
        >
          <Box
            className={`flex flex-col justify-center w-full lg:w-1/2 h-full flex-grow
            bg-indigo-600 text-white py-5 lg:py-3 px-5 rounded-l`}
          >
            <Heading size="lg" className="text-white mb-3 text-center lg:text-left">Welcome</Heading>
            <Text size="lg" className="text-white text-center lg:text-left">
              {`The Igbo API Editor's Platform is the main platform that allows 
            for directly editing, updating, adding, and maintaining the words and examples in 
            the Igbo API database.`}
            </Text>
          </Box>
          <Box
            className={`flex flex-col justify-center w-full h-full lg:w-1/2
            space-y-3 lg:space-y-2 py-5 px-5 overflow-y-overlay`}
          >
            {filledAuthForm ? (
              <Box>
                {successfulCreateAccount ? (
                  <Text data-test="login-success-message" className="text-green-500 mt-2 text-center">
                    New account has been created. Wait for admin approval to be admitted to the platform.
                    You will receive a Slack DM once you have been granted access.
                  </Text>
                ) : null}
                {errorUponSubmitting ? (
                  <Text data-test="login-error-message" className="error text-red-500 mt-2 text-center">
                    {`Error: ${errorUponSubmitting}. Reach out to ${LocalStorageKeys.ADMIN_NAME} if you have questions`}
                  </Text>
                ) : null}
                <Box className="w-full flex flex-row justify-center items-center my-4">
                  <Button colorScheme="green" onClick={refreshPage}>
                    Refresh Page
                  </Button>
                </Box>
              </Box>
            ) : <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
