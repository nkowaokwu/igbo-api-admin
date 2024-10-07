import React, { ReactElement } from 'react';
import { Button, Hide, HStack, Image, Link } from '@chakra-ui/react';
import getAWSAsset from 'src/utils/getAWSAsset';
import { REQUEST_DEMO_URL } from 'src/Core/constants';

const NkowaokwuImage = getAWSAsset('/images/logo.svg');

const NavBar = ({ hideButtons }: { hideButtons?: boolean }): ReactElement => {
  const handleLogin = () => {
    window.location.href = '#/login';
  };

  return (
    <HStack
      p={4}
      borderBottomWidth={hideButtons ? '0px' : '1px'}
      borderBottomColor="gray.300"
      width="100vw"
      backgroundColor="white"
      position="fixed"
      justifyContent="center"
      top={0}
      zIndex={1}
    >
      <HStack className="w-10/12" justifyContent="space-between">
        <Link href="/home">
          <Image src={NkowaokwuImage} alt="logo" width="125px" height="40px" />
        </Link>
        {hideButtons ? null : (
          <HStack gap={4}>
            <Button variant="ghost" onClick={handleLogin}>
              Log in
            </Button>
            <Hide below="md">
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = REQUEST_DEMO_URL;
                }}
              >
                Request demo
              </Button>
            </Hide>
          </HStack>
        )}
      </HStack>
    </HStack>
  );
};

export default NavBar;
