import React, { ReactElement, useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';
import {
  Box,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Text,
  FormLabel,
} from '@chakra-ui/react';
import {
  UserCredential,
  getAuth,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import errorCodes from 'src/Login/constants/errorCodes';
import EmailAndPhoneLogin from 'src/Login/components/EmailAndPhoneLogin';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import { IdentifierType } from 'src/Login/components/types';
import ProgressHeader from 'src/Login/components/ProgressHeader';
import ConfirmationCodeInput from 'src/Login/components/ConfirmationCodeInput';
import { handleUserResult } from '../utils/handleUserResult';

const auth = getAuth();
auth.useDeviceLanguage();

const createRecaptchaVerifier = () =>
  new RecaptchaVerifier(
    auth,
    'recaptcha-container',
    {
      size: 'invisible',
      callback: (/* response */) => {
        // console.log('prepared phone auth process', response);
      },
    },
    auth,
  );
const clearRecaptchaVerifier = () => {
  window.recaptchaVerifier.clear();
  window.recaptchaVerifier = createRecaptchaVerifier();
};
window.recaptchaVerifier = createRecaptchaVerifier();

const LoginModal = ({
  isOpen,
  onClose,
  userLoginState,
  setUserLoginState,
  setErrorMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  setErrorMessage: (value: string) => void;
  userLoginState: UserLoginState;
  setUserLoginState: (value: UserLoginState) => void;
}): ReactElement => {
  const [identifierType, setIdentifierType] = useState(IdentifierType.EMAIL);
  const [displayName, setDisplayName] = useState<string>('');
  const [userIdentifier, setUserIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumberConfirmationCode, setPhoneNumberConfirmationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handlePageRefresh = () => {
    setUserLoginState(UserLoginState.LOGIN);
    setIdentifierType(IdentifierType.EMAIL);
  };

  const handlePhoneNumberLogin = async () => {
    const phoneNumber = `+${userIdentifier}`;
    setIsLoading(true);
    await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
      .then((confirmationResult) => {
        act(() => {
          setIsLoading(false);
        });
        if (userLoginState === UserLoginState.SIGN_UP) {
          setUserLoginState(UserLoginState.CONFIRM_NUMBER);
          window.confirmationResult = confirmationResult;
        } else {
          handleUserResult({
            toast,
            setErrorMessage,
          });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        clearRecaptchaVerifier();
        toast({
          title: 'An error occurred',
          description: errorCodes[err.code],
          status: 'error',
          duration: 10000,
          isClosable: true,
          position: 'top-right',
          variant: 'left-accent',
        });
      });
  };

  const handleConfirmPhoneNumber = async () => {
    setIsLoading(true);
    window.confirmationResult
      .confirm(phoneNumberConfirmationCode)
      .then(async (result) => {
        setIsLoading(false);
        setUserLoginState(UserLoginState.SUCCESS);
        await updateProfile(result.user, { displayName });
        handleUserResult({
          toast,
          setErrorMessage,
        });
      })
      .catch((err) => {
        setIsLoading(false);
        clearRecaptchaVerifier();
        toast({
          title: 'An error occurred',
          description: errorCodes[err.code],
          status: 'error',
          duration: 10000,
          isClosable: true,
          position: 'top-right',
          variant: 'left-accent',
        });
      });
  };

  const handleUserLogin = async () => {
    if (identifierType === IdentifierType.PHONE) {
      return handlePhoneNumberLogin();
    }
    return (
      userLoginState === UserLoginState.PASSWORD_RECOVERY
        ? sendPasswordResetEmail(auth, userIdentifier)
        : userLoginState === UserLoginState.LOGIN && identifierType === IdentifierType.EMAIL
        ? signInWithEmailAndPassword(auth, userIdentifier, password)
        : userLoginState === UserLoginState.SIGN_UP && identifierType === IdentifierType.EMAIL
        ? createUserWithEmailAndPassword(auth, userIdentifier, password)
        : new Promise((resolve) => resolve(true))
    )
      .then(async (userCredential: UserCredential | void) => {
        if (userLoginState === UserLoginState.PASSWORD_RECOVERY) {
          setErrorMessage('');
          const message = 'Check your email to reset your password.';
          toast({
            title: 'Check your email 📫',
            description: message,
            status: 'info',
            duration: 10000,
            isClosable: true,
            position: 'top-right',
            variant: 'left-accent',
          });
        } else if (userLoginState === UserLoginState.SIGN_UP && userCredential) {
          if (displayName) {
            await updateProfile(userCredential.user, {
              displayName,
            });
          }
          await sendEmailVerification(userCredential.user).then(() => {
            setErrorMessage('');
            setUserLoginState(UserLoginState.CHECK_EMAIL);
            const message = 'Check your email to verify your account.';
            toast({
              title: 'Check your email 📫',
              description: message,
              status: 'info',
              duration: 10000,
              isClosable: true,
              position: 'top-right',
              variant: 'left-accent',
            });
          });
        } else {
          if (!auth.currentUser.emailVerified) {
            await sendEmailVerification(userCredential.user);
            const message = 'Please verify your email to login.';
            setErrorMessage(message);
            return toast({
              title: 'Verify your account',
              description: message,
              status: 'warning',
              duration: 10000,
              isClosable: true,
              position: 'top-right',
              variant: 'left-accent',
            });
          }
          try {
            if (displayName) {
              await updateProfile(auth.currentUser, {
                displayName,
              });
            }
            handleUserResult({
              toast,
              setErrorMessage,
            });
          } catch (err) {
            const message = 'Unable to sign in user';
            // console.log(message, err);
            toast({
              title: 'An error occurred',
              description: message,
              status: 'error',
              duration: 10000,
              isClosable: true,
              position: 'top-right',
              variant: 'left-accent',
            });
          }
        }
        return null;
      })
      .catch((error) => {
        setErrorMessage(errorCodes[error.code]);
        toast({
          title: 'An error occurred',
          description: errorCodes[error.code],
          status: 'info',
          duration: 10000,
          isClosable: true,
          position: 'top-right',
          variant: 'left-accent',
        });
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return userLoginState === UserLoginState.CONFIRM_NUMBER
      ? handleConfirmPhoneNumber()
      : userLoginState === UserLoginState.CHECK_EMAIL
      ? handlePageRefresh()
      : handleUserLogin();
  };

  // Automatically submits the confirmation request
  useEffect(() => {
    if (userLoginState === UserLoginState.CONFIRM_NUMBER && !!phoneNumberConfirmationCode) {
      handleConfirmPhoneNumber();
    }
  }, [userLoginState, phoneNumberConfirmationCode]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" isCentered>
        <ModalOverlay />
        <ModalContent data-test="login-modal" height="auto">
          <ProgressHeader userLoginState={userLoginState} />
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody mb={4}>
              {userLoginState === UserLoginState.CHECK_EMAIL && identifierType === IdentifierType.EMAIL ? (
                <Box className="flex flex-col justify-center items-center space-y-4">
                  <Heading as="h1">Check your email 📫</Heading>
                  <Text textAlign="center">
                    Click on the verification link sent to your email. Then log into your account.
                  </Text>
                </Box>
              ) : userLoginState === UserLoginState.SUCCESS && identifierType === IdentifierType.PHONE ? (
                <Box className="flex flex-col justify-center items-center space-y-4">
                  <Heading as="h1">Success 🎉</Heading>
                  <Text textAlign="center">Your phone number has been confirmed. Redirecting to the platform...</Text>
                </Box>
              ) : userLoginState !== UserLoginState.CONFIRM_NUMBER ? (
                <EmailAndPhoneLogin
                  userLoginState={userLoginState}
                  setUserLoginState={setUserLoginState}
                  identifierType={identifierType}
                  setIdentifierType={setIdentifierType}
                  setDisplayName={setDisplayName}
                  setUserIdentifier={setUserIdentifier}
                  setPassword={setPassword}
                />
              ) : (
                <Box className="space-y-4">
                  <Text>You have received an SMS text with a code. Please paste that code here</Text>
                  <Box>
                    <FormLabel>Confirmation code</FormLabel>
                    <ConfirmationCodeInput onComplete={setPhoneNumberConfirmationCode} />
                  </Box>
                </Box>
              )}
            </ModalBody>

            <ModalFooter className="w-full flex flex-row justify-between items-center" justifyContent="space-between">
              <Button
                type="submit"
                backgroundColor="primary"
                _hover={{
                  backgroundColor: 'primary',
                }}
                _active={{
                  backgroundColor: 'primary',
                }}
                _focus={{
                  backgroundColor: 'primary',
                }}
                color="white"
                width="full"
                isLoading={isLoading}
                isDisabled={isLoading}
                data-test="login-modal-button"
              >
                {userLoginState === UserLoginState.LOGIN
                  ? 'Sign in'
                  : userLoginState === UserLoginState.SUCCESS
                  ? 'Enter platform'
                  : userLoginState === UserLoginState.CHECK_EMAIL
                  ? 'Log in'
                  : userLoginState === UserLoginState.PASSWORD_RECOVERY
                  ? 'Recover password'
                  : identifierType === IdentifierType.PHONE && userLoginState === UserLoginState.CONFIRM_NUMBER
                  ? 'Confirm number'
                  : identifierType === IdentifierType.PHONE && userLoginState !== UserLoginState.CONFIRM_NUMBER
                  ? 'Next'
                  : 'Sign up'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginModal;
