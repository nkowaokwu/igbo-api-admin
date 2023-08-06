import React, { ReactElement } from 'react';
import { Button, Image, Text, useToast } from '@chakra-ui/react';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import getAWSAsset from 'src/utils/getAWSAsset';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import { handleUserResult } from '../utils/handleUserResult';

const FacebookImage = getAWSAsset('/icons/facebook.svg');

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
            const { email: existingEmail, credential: existingCredential } = error;
            // @ts-expect-error fetchSignInMethodsForEmail
            const providers = await auth.fetchSignInMethodsForEmail(existingEmail);
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
              // @ts-expect-error linkWithCredentials
              result.user.linkWithCredential(existingCredential);
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
      leftIcon={<Image className="mr-4" width="24px" src={FacebookImage} alt="Facebook logo" />}
      width="full"
      h="48px"
      px={4}
      pl={3}
      borderRadius="lg"
      onClick={signInWithFacebook}
      backgroundColor="#4267B2"
      _hover={{
        backgroundColor: '#4267B2',
      }}
      _active={{
        backgroundColor: '#4267B2',
      }}
      _focus={{
        backgroundColor: '#4267B2',
      }}
    >
      <Text flex={1} color="white" ml={-6}>
        {userLoginState === UserLoginState.SIGN_UP ? 'Sign up with Facebook' : 'Sign in with Facebook'}
      </Text>
    </Button>
  );
};

export default FacebookLogin;
