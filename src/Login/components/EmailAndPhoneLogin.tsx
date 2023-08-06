import React, { ReactElement, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';
import {
  Box,
  Button,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Text,
  Link,
} from '@chakra-ui/react';
import PersonIcon from '@mui/icons-material/Person';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { IdentifierType } from 'src/Login/components/types';

const SwitchIdentifierMessage = {
  [IdentifierType.PHONE]: {
    useMessage: 'Use email instead',
    label: 'Phone number',
    placeholder: 'Phone number',
    name: 'phone',
    type: 'number',
  },
  [IdentifierType.EMAIL]: {
    useMessage: 'Use phone instead',
    label: 'Email address',
    placeholder: 'Email address',
    name: 'email',
    type: 'email',
  },
};

const EmailAndPhoneLogin = ({
  userLoginState,
  identifierType,
  setUserLoginState,
  setIdentifierType,
  setDisplayName,
  setUserIdentifier,
  setPassword,
}: {
  userLoginState: UserLoginState;
  identifierType: IdentifierType;
  setUserLoginState: React.Dispatch<React.SetStateAction<string>>;
  setIdentifierType: React.Dispatch<React.SetStateAction<IdentifierType>>;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  setUserIdentifier: React.Dispatch<React.SetStateAction<string | number>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}): ReactElement => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(userLoginState === UserLoginState.LOGIN);

  const handleIdentifierTypeSwitch = () => {
    setIdentifierType(identifierType === IdentifierType.EMAIL ? IdentifierType.PHONE : IdentifierType.EMAIL);
  };

  const handlePasswordRecovery = () => {
    setUserLoginState(UserLoginState.PASSWORD_RECOVERY);
  };

  useEffect(() => {
    if (userLoginState === UserLoginState.PASSWORD_RECOVERY) {
      setIdentifierType(IdentifierType.EMAIL);
    }
  }, [userLoginState]);

  return (
    <Box className="w-full space-y-3">
      {userLoginState === UserLoginState.SIGN_UP ? (
        <>
          <FormLabel>Full name</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <PersonIcon sx={{ color: 'var(--chakra-colors-gray-400)' }} />
            </InputLeftElement>
            <Input
              placeholder="Full name"
              name="displayName"
              onChange={(e) => setDisplayName(e.target.value)}
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
      {userLoginState === UserLoginState.PASSWORD_RECOVERY ? (
        <Text>A password reset link will be sent to your email.</Text>
      ) : null}
      <FormLabel>{SwitchIdentifierMessage[identifierType].label}</FormLabel>
      {identifierType === IdentifierType.EMAIL ? (
        <InputGroup>
          <InputLeftElement pointerEvents="none" zIndex="1">
            <EmailIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={SwitchIdentifierMessage[identifierType].placeholder}
            name={SwitchIdentifierMessage[identifierType].name}
            type={SwitchIdentifierMessage[identifierType].type}
            onChange={(e) => setUserIdentifier(e.target.value)}
            required
            _focus={{
              outline: 'none',
              borderColor: 'primary',
              borderWidth: '2px',
            }}
          />
        </InputGroup>
      ) : (
        <PhoneInput inputClass="phone-input" onChange={setUserIdentifier} />
      )}
      {userLoginState !== UserLoginState.PASSWORD_RECOVERY ? (
        <Box className="w-full flex flex-row justify-end items-center">
          <Button
            height="fit-content"
            fontWeight="normal"
            variant="ghost"
            fontSize="sm"
            px={0}
            _hover={{ backgroundColor: 'transparent' }}
            _active={{ backgroundColor: 'transparent' }}
            _focus={{ backgroundColor: 'transparent' }}
            color="primary"
            textDecoration="underline"
            onClick={handleIdentifierTypeSwitch}
            outline="none"
          >
            {SwitchIdentifierMessage[identifierType].useMessage}
          </Button>
        </Box>
      ) : null}
      {userLoginState === UserLoginState.PASSWORD_RECOVERY ? (
        <Text fontSize="xs">
          Please email{' '}
          <Link href="mailto:kedu@nkowaokwu.com" color="primary">
            kedu@nkowaokwu.com
          </Link>{' '}
          if you are recovering a password for an account created with a phone number.
        </Text>
      ) : null}
      {userLoginState !== UserLoginState.PASSWORD_RECOVERY ? (
        <>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" zIndex="1">
              <LockIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Password"
              type={userLoginState === UserLoginState.SIGN_UP && isPasswordVisible ? 'text' : 'password'}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              _focus={{
                outline: 'none',
                borderColor: 'primary',
                borderWidth: '2px',
              }}
            />
            {userLoginState === UserLoginState.SIGN_UP ? (
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
    </Box>
  );
};

export default EmailAndPhoneLogin;
