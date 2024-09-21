import React, { ReactElement } from 'react';
import { Button, HStack, Image, Link } from '@chakra-ui/react';
import getAWSAsset from 'src/utils/getAWSAsset';
import { REQUEST_ACCESS_URL } from 'src/Core/constants';

const NkowaokwuImage = getAWSAsset('/images/logo.svg');

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
      justifyContent="center"
      top={0}
      zIndex={1}
    >
      <HStack className="w-10/12" justifyContent="space-between">
        <Link href="/home">
          <Image src={NkowaokwuImage} alt="logo" width="125px" />
        </Link>
        <HStack gap={4}>
          <Button variant="ghost" onClick={handleLogin}>
            Log in
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.location.href = REQUEST_ACCESS_URL;
            }}
          >
            Request access
          </Button>
        </HStack>
      </HStack>
    </HStack>
  );
};

export default NavBar;
