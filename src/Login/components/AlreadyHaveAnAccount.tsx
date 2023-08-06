import React, { ReactElement } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import UserLoginState from 'src/backend/shared/constants/UserLoginState';

const AlreadyHaveAnAccount = ({ onClick }: { onClick: (value: UserLoginState) => () => void }): ReactElement => (
  <Box className="w-full">
    <Text mt={2} fontWeight="bold">
      Already have an account?
    </Text>
    <Button
      borderColor="gray.300"
      borderWidth="1px"
      width="full"
      variant="primary"
      backgroundColor="white"
      color="gray.500"
      data-test="open-login-modal"
      onClick={onClick(UserLoginState.LOGIN)}
      mt={2}
    >
      Log into account
    </Button>
  </Box>
);

export default AlreadyHaveAnAccount;
