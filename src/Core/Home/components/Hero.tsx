import React, { ReactElement } from 'react';
import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { REQUEST_DEMO_URL } from 'src/Core/constants';

const Hero = (): ReactElement => (
  <VStack width="full">
    <VStack className="w-10/12 lg:w-1/2" justifyContent="center" py={{ base: 32, lg: '' }} gap={8}>
      <VStack justifyContent="center" width="full" gap={4}>
        <Heading lineHeight="1.5" fontSize="4xl" textAlign="center">
          The all-in-one platform for data collection and transparency
        </Heading>
        <Text lineHeight="2.5" textAlign="center">
          Manage your data collection with ease. The Igbo API Editor Platform delivers a powerful suite for data
          collection, annotating, labeling, managing, and exporting.
        </Text>
      </VStack>
      <Button
        size="lg"
        variant="primary"
        zIndex={0}
        onClick={() => {
          window.location.href = REQUEST_DEMO_URL;
        }}
      >
        Request demo
      </Button>
    </VStack>
  </VStack>
);

export default Hero;
