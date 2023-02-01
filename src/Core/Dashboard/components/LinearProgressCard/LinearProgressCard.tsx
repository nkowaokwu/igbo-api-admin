import React, { ReactElement } from 'react';
import {
  Box,
  Skeleton,
  Heading,
  Text,
  Divider,
} from '@chakra-ui/react';
import LinearProgressCardInterface from './LinearProgressCardInterface';
import StatBody from './StatBody';

const LinearProgressCard = ({
  heading,
  description,
  stats,
  isLoaded,
}: LinearProgressCardInterface): ReactElement => (
  <Skeleton isLoaded={isLoaded}>
    <Box
      className="rounded border bg-white space-y-3"
      borderColor="gray.300"
      p={3}
    >
      <Box>
        <Heading fontSize="lg" fontFamily="Silka">{heading}</Heading>
        <Text fontFamily="Silka">{description}</Text>
      </Box>
      <Box width="full">
        <Divider backgroundColor="gray.100" />
      </Box>
      {stats.map((stat) => (
        <StatBody {...stat} />
      ))}
    </Box>
  </Skeleton>
);

export default LinearProgressCard;
