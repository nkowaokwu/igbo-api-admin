import React, { ReactElement } from 'react';
import { Skeleton, Heading, Text, Divider, VStack } from '@chakra-ui/react';
import LinearProgressCardInterface from './LinearProgressCardInterface';
import StatBody from './StatBody';

const LinearProgressCard = ({
  heading,
  description,
  stats,
  isLoaded,
  children,
}: LinearProgressCardInterface): ReactElement => (
  <Skeleton isLoaded={isLoaded} width="full">
    <VStack
      width="full"
      alignItems="start"
      backgroundColor="white"
      className="border"
      borderRadius="md"
      borderColor="gray.300"
      gap={2}
      p={5}
    >
      <VStack width="full" gap={1} alignItems="start">
        <Heading fontSize="lg" fontFamily="Silka">
          {heading}
        </Heading>
        <Text fontFamily="Silka">{description}</Text>
      </VStack>
      <Divider borderColor="gray.300" />
      {stats.map((stat) => (
        <StatBody key={stat.heading} {...stat} />
      ))}
      {children}
    </VStack>
  </Skeleton>
);

export default LinearProgressCard;
