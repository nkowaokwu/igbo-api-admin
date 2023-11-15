import React, { ReactElement } from 'react';
import { Box, Skeleton, Heading, Text, Divider } from '@chakra-ui/react';
import LinearProgressCardInterface from './LinearProgressCardInterface';
import StatBody from './StatBody';

const LinearProgressCard = ({
  heading,
  description,
  stats,
  isLoaded,
  isGeneric = false,
  children,
}: LinearProgressCardInterface): ReactElement => (
  <Skeleton isLoaded={isLoaded} width="full">
    <Box className="border bg-white space-y-3 w-full" borderRadius="md" borderColor="gray.300" p={5}>
      <Box className="space-y-3">
        <Heading fontSize="lg" fontFamily="Silka">
          {heading}
        </Heading>
        <Text fontFamily="Silka">{description}</Text>
      </Box>
      <Box width="full">
        <Divider backgroundColor="gray.100" />
      </Box>
      {stats.map((stat) => (
        <StatBody key={stat.heading} isGeneric={isGeneric} {...stat} />
      ))}
      {children}
    </Box>
  </Skeleton>
);

export default LinearProgressCard;
