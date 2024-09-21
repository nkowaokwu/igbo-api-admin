import React, { ReactElement } from 'react';
import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { REQUEST_ACCESS_URL } from 'src/Core/constants';

const Hero = (): ReactElement => (
  <VStack width="full">
    <VStack className="w-1/2" height="xl" justifyContent="center">
      <Heading lineHeight="1.5" fontSize="4xl" textAlign="center">
        The all-in-one platform for data collection and transparency
      </Heading>
      <Text lineHeight="2.5" textAlign="center">
        Manage your data collection with ease. The Igbo API Editor Platform delivers a powerful suite for data
        collection, annotating, labeling, managing, and exporting.
      </Text>
      <Button
        size="lg"
        variant="primary"
        zIndex={0}
        onClick={() => {
          window.location.href = REQUEST_ACCESS_URL;
        }}
      >
        Request access
      </Button>
    </VStack>
  </VStack>
);

export default Hero;
