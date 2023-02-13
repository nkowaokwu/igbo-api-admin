import React, { ReactElement, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';

const EmptyExamples = (
  {
    recording = false,
    setIsDirty,
    goHome,
  }
  : {
    recording?: boolean,
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
    goHome: () => void,
  },
): ReactElement => {
  useEffect(() => {
    setIsDirty(false);
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className="space-y-12 h-full"
    >
      <Box className="space-y-4">
        <Heading textAlign="center">{`There are no examples to ${recording ? 'record' : 'review'}`}</Heading>
        <Text textAlign="center">
          Please check back later for more examples to be added
        </Text>
      </Box>
      <Box className="space-x-3">
        <Button
          colorScheme="gray"
          borderRadius="full"
          fontFamily="Silka"
          fontWeight="bold"
          onClick={goHome}
        >
          Go back home
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyExamples;
