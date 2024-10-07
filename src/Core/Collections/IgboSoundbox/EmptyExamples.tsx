import React, { ReactElement, useEffect } from 'react';
import { noop } from 'lodash';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

const EmptyExamples = ({
  recording = false,
  setIsDirty = noop,
}: {
  recording?: boolean;
  setIsDirty?: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement => {
  const goHome = () => {
    window.location.href = '#/';
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
        <Heading textAlign="center">{`There are no sentences to ${recording ? 'record' : 'review'}`}</Heading>
        <Text textAlign="center">Please check back later for more sentences to be added</Text>
      </Box>
      <Box className="space-x-3">
        <Button colorScheme="gray" borderRadius="full" fontFamily="Silka" fontWeight="bold" onClick={goHome}>
          Go back home
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyExamples;
