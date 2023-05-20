import React, { ReactElement } from 'react';
import {
  Button,
  Image,
  Text,
  useToast,
} from '@chakra-ui/react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import getAWSAsset from 'src/utils/getAWSAsset';
import { handleUserResult } from './handleUserResult';

const GoogleImage = getAWSAsset('/icons/google.svg');

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

const GoogleLogin = ({
  setErrorMessage,
} : {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
}): ReactElement => {
  const toast = useToast();

  const signInWithGoogle = () => {
    setErrorMessage('');
    return signInWithPopup(auth, googleProvider)
      .then(() => {
        handleUserResult({
          toast,
          setErrorMessage,
        });
      }).catch((error) => {
        console.log(error);
        setErrorMessage(error.message);
      });
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
      <Text flex={1} fontSize="md" color="gray.500" ml={-6}>Sign in with Google</Text>
    </Button>
  );
};

export default GoogleLogin;
