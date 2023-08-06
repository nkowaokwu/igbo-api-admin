import React, { ReactElement } from 'react';
import { Button, Image, Text, useToast } from '@chakra-ui/react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import getAWSAsset from 'src/utils/getAWSAsset';
import errorCodes from 'src/Login/constants/errorCodes';
import { handleUserResult } from '../utils/handleUserResult';

const GoogleImage = getAWSAsset('/icons/google.svg');

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

const GoogleLogin = ({
  setErrorMessage,
  userLoginState,
}: {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  userLoginState: UserLoginState;
}): ReactElement => {
  const toast = useToast();

  const signInWithGoogle = () => {
    setErrorMessage('');
    return (
      signInWithPopup(auth, googleProvider)
        // @ts-expect-error
        .then(({ _tokenResponse } = { _tokenResponse: { isNewUser: false } }) => {
          const { isNewUser } = _tokenResponse;
          handleUserResult({
            toast,
            setErrorMessage,
            isNewUser,
          });
        })
        .catch((error) => {
          setErrorMessage(errorCodes[error.code]);
        })
    );
  };

  return (
    <Button
      display="flex"
      className="font-bold"
      justifyContent="space-between"
      leftIcon={<Image className="mr-4" width="18px" src={GoogleImage} alt="Google logo" />}
      width="full"
      px={4}
      h="48px"
      border="1px"
      borderRadius="lg"
      borderColor="gray.300"
      onClick={signInWithGoogle}
      backgroundColor="#FFFFFF"
      _hover={{
        backgroundColor: '#FFFFFF',
      }}
      _active={{
        backgroundColor: '#FFFFFF',
      }}
      _focus={{
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text flex={1} fontSize="md" color="gray.500" ml={-6}>
        {userLoginState === UserLoginState.SIGN_UP ? 'Sign up with Google' : 'Sign in with Google'}
      </Text>
    </Button>
  );
};

export default GoogleLogin;
