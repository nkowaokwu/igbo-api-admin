import { Heading, Text, VStack } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

const useCases = [
  {
    title: 'Language and Culture Restoration',
    description:
      'Language archiving teams are able to collect and organize large amounts of text and audio language data.',
  },
  {
    title: 'AI Engineers and Data Teams',
    description:
      // eslint-disable-next-line max-len
      'Growing technical teams are able to scale their data collection pipelines to inform business decisions and improve AI features.',
  },
  {
    title: 'Archivists and Historians',
    description: 'Historians are able to upload images and annotate each one to preserve historical context.',
  },
  {
    title: 'Researchers and Academics',
    description: 'Academics are able to collect their own data to integrate into their research and teachings.',
  },
];

const UseCases = (): ReactElement => (
  <VStack alignItems="center" width="full" gap={4} py={32} backgroundColor="blackAlpha.800">
    <VStack className="w-10/12" gap={12}>
      <VStack className="w-full lg:w-1/2">
        <Heading color="white" textAlign="center">
          Allow your team to own and manage your growing data
        </Heading>
        <Text color="gray.300">One data platform to help every type of team.</Text>
      </VStack>
      <VStack gap={12} width="full">
        {useCases.map(({ title, description }) => (
          <VStack
            alignItems="center"
            width="full"
            backgroundColor="blackAlpha.500"
            borderRadius="xl"
            height="sm"
            justifyContent="center"
            transform="scale(1)"
            transition="transform .1s ease"
            _hover={{
              transform: 'scale(1.03)',
            }}
            gap={6}
            p={8}
          >
            <Heading color="white">{title}</Heading>
            <Text color="gray.300">{description}</Text>
          </VStack>
        ))}
      </VStack>
    </VStack>
  </VStack>
);

export default UseCases;
