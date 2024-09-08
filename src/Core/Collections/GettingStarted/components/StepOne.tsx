import React from 'react';
import { Heading, Text, HStack, VStack } from '@chakra-ui/react';
import UserPersona from 'src/backend/shared/constants/UserPersona';

const StepOne = () => (
  <HStack>
    <Heading>Which best describes who you are?</Heading>
    <Text>This will help personalize your experience.</Text>
    <VStack>
      <Heading as="h2">Team Leader</Heading>
      <Text>You have a project you would like to work on with a team.</Text>
    </VStack>
    <VStack>
      <Heading as="h2">Individual</Heading>
      <Text>You are looking to just get started contributing with ease.</Text>
    </VStack>
    <Text>Don&apos;t worry, you can change these later.</Text>
  </HStack>
);

export default StepOne;
