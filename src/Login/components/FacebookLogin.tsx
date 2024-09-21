import React, { ReactElement } from 'react';
import { Button, Text, useToast } from '@chakra-ui/react';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithPopup,
} from 'firebase/auth';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import { LuFacebook } from 'react-icons/lu';
import { handleUserResult } from '../utils/handleUserResult';

const auth = getAuth();
const facebookProvider = new FacebookAuthProvider();

const FacebookLogin = ({
  setErrorMessage,
  userLoginState,
}: {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  userLoginState: UserLoginState;
}): ReactElement => {
  const toast = useToast();

  const signInWithFacebook = () => {
    setErrorMessage('');
    return (
      signInWithPopup(auth, facebookProvider)
        // @ts-expect-error
        .then(({ _tokenResponse } = { _tokenResponse: { isNewUser: false } }) => {
          const { isNewUser } = _tokenResponse;
          handleUserResult({
            toast,
            setErrorMessage,
            isNewUser,
          });
        })
        .catch(async (error) => {
          if (error.code === 'auth/account-exists-with-different-credential') {
            const {
              customData: { email: existingEmail },
            } = error;
            const providers = await fetchSignInMethodsForEmail(auth, existingEmail);
            // Links Facebook account to Google account if a Google account already exists
            // with the associated email
            if (providers.indexOf(GoogleAuthProvider.PROVIDER_ID) !== -1) {
              const googleProvider = new GoogleAuthProvider();
              googleProvider.setCustomParameters({ login_hint: existingEmail });
              const result = await signInWithPopup(auth, googleProvider);

              await handleUserResult({
                toast,
                setErrorMessage,
                isNewUser: false,
              });
              linkWithPopup(result.user, facebookProvider);
            }
            return null;
          }
          return setErrorMessage(error.message);
        })
    );
  };

  return (
    <Button
      display="flex"
      className="font-bold"
      justifyContent="space-between"
      width="full"
      height="48px"
      borderWidth="1px"
      borderRadius="lg"
      onClick={signInWithFacebook}
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
      <LuFacebook />
      <Text flex={1} ml={-6} color="gray.500">
        {userLoginState === UserLoginState.SIGN_UP ? 'Sign up with Facebook' : 'Sign in with Facebook'}
      </Text>
    </Button>
  );
};

export default FacebookLogin;
