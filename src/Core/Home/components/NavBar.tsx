import React, { ReactElement } from 'react';
import { Button, HStack, Text } from '@chakra-ui/react';

const NavBar = (): ReactElement => {
  const handleLogin = () => {
    window.location.href = '#/login';
  };

  return (
    <HStack
      p={4}
      borderBottomWidth="1px"
      borderBottomColor="gray.300"
      width="full"
      backgroundColor="white"
      position="fixed"
    >
      <Text>Nkọwa okwu</Text>
      <Button variant="ghost" onClick={handleLogin}>
        Log in
      </Button>
      <Button>Request access</Button>
    </HStack>
  );
};

export default NavBar;
