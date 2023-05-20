import React, { ReactElement, useEffect, useState } from 'react';
import {
  getAuth,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import {
  Button,
  Fade,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { handleUserResult } from './handleUserResult';

const EmailLogin = ({
  setErrorMessage,
  userLoginState,
  setUserLoginState,
} : {
  setErrorMessage: (errorMessage: string) => void,
  userLoginState: UserLoginState,
  setUserLoginState: React.Dispatch<React.SetStateAction<string>>,
}): ReactElement => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const auth = getAuth();
  const toast = useToast();

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-expect-error email
    const email = e.target.email.value;
    // @ts-expect-error password
    const password = e.target?.password?.value;
    // @ts-expect-error displayName
    const displayName = e.target?.displayName?.value;

    const loginUserPromise = userLoginState === UserLoginState.PASSWORD_RECOVERY
      ? sendPasswordResetEmail(auth, email)
      : userLoginState === UserLoginState.LOGIN
        ? signInWithEmailAndPassword(auth, email, password)
        : createUserWithEmailAndPassword(auth, email, password);
    await loginUserPromise
      .then(async () => {
        if (userLoginState === UserLoginState.PASSWORD_RECOVERY) {
          setSuccessMessage('Check your email to reset your password.');
        } else {
          handleUserResult({
            toast,
            setErrorMessage,
          });
          try {
            await updateProfile(auth.currentUser, {
              displayName,
            });
          } catch (err) {
            console.log('Unable to update display name', err);
          }
        }
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  const handlePasswordRecovery = () => {
    setUserLoginState(UserLoginState.PASSWORD_RECOVERY);
  };

  useEffect(() => {
    if (userLoginState !== UserLoginState.PASSWORD_RECOVERY) {
      setSuccessMessage('');
    }
  }, [userLoginState]);

  return (
    <form onSubmit={handleUserLogin} className="w-full space-y-3">
      {userLoginState === UserLoginState.SIGNUP ? (
        <>
          <FormLabel>Full name</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" />
            <Input
              placeholder="Full name"
              name="displayName"
              required
              _focus={{
                outline: 'none',
                borderColor: 'primary',
                borderWidth: '2px',
              }}
            />
          </InputGroup>
        </>
      ) : null}
      <FormLabel>Email address</FormLabel>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
        >
          <EmailIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Email address"
          type="email"
          name="email"
          required
          _focus={{
            outline: 'none',
            borderColor: 'primary',
            borderWidth: '2px',
          }}
        />
      </InputGroup>
      <Fade in={!!successMessage}>
        <Text color="green.400">{successMessage}</Text>
      </Fade>
      {userLoginState !== UserLoginState.PASSWORD_RECOVERY ? (
        <>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
            >
              <LockIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Password"
              type={userLoginState === UserLoginState.SIGNUP && isPasswordVisible ? 'text' : 'password'}
              name="password"
              required
              _focus={{
                outline: 'none',
                borderColor: 'primary',
                borderWidth: '2px',
              }}
            />
            {userLoginState === UserLoginState.SIGNUP ? (
              <InputRightElement width="4.5rem">
                <Button
                  bg="transparent"
                  color="gray"
                  h="1.75rem"
                  size="xs"
                  _hover={{
                    backgroundColor: 'transparent',
                    color: 'gray',
                  }}
                  _active={{
                    backgroundColor: 'transparent',
                    color: 'gray',
                  }}
                  _focus={{
                    backgroundColor: 'transparent',
                    color: 'gray',
                  }}
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            ) : null}
          </InputGroup>
        </>
      ) : null}
      {userLoginState === UserLoginState.LOGIN ? (
        <Button
          color="gray.500"
          p={0}
          variant="ghost"
          _hover={{
            backgroundColor: 'white',
            color: 'gray.600',
          }}
          _active={{
            backgroundColor: 'white',
          }}
          onClick={handlePasswordRecovery}
        >
          Forgot password?
        </Button>
      ) : null}
      <VStack>
        <Button
          type="submit"
          backgroundColor="green.400"
          _hover={{
            backgroundColor: 'green.700',
          }}
          _active={{
            backgroundColor: 'green.700',
          }}
          _focus={{
            backgroundColor: 'green.700',
          }}
          color="white"
          width="full"
        >
          {userLoginState === UserLoginState.PASSWORD_RECOVERY
            ? 'Recover password'
            : userLoginState === UserLoginState.LOGIN
              ? 'Sign in'
              : 'Sign up'}
        </Button>
      </VStack>
    </form>
  );
};

export default EmailLogin;
