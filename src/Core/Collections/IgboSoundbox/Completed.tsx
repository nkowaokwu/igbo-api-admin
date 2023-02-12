import React, { ReactElement, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';

const Completed = (
  {
    setIsComplete,
    recording = false,
    setIsDirty,
    goHome,
  }
  : {
    setIsComplete: React.Dispatch<React.SetStateAction<boolean>>,
    recording?: boolean,
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
    goHome: () => void,
  },
): ReactElement => {
  const handleMore = () => {
    setIsComplete(false);
  };

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
        <Heading textAlign="center">Great work!</Heading>
        <Text textAlign="center">
          {recording ? 'Your sentence recordings have been submitted.' : 'Your sentence reviews have been submitted.'}
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
        <Button
          colorScheme="green"
          borderRadius="full"
          fontFamily="Silka"
          fontWeight="bold"
          onClick={handleMore}
        >
          {recording ? 'Record more sentences' : 'Review more sentences'}
        </Button>
      </Box>
    </Box>
  );
};

export default Completed;
