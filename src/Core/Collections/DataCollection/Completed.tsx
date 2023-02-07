import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';

const RecordingsCompleted = (
  { setIsComplete, recording = false }
  : { setIsComplete: React.Dispatch<React.SetStateAction<boolean>>, recording?: boolean },
): ReactElement => {
  const handleRecordMore = () => {
    setIsComplete(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className="space-y-4"
    >
      <Heading>Great work!</Heading>
      <Text>
        {recording ? 'Your sentence recordings have been submitted' : 'Your sentence reviews have been submitted'}
      </Text>
      <Box className="space-x-3">
        <Button colorScheme="gray">Go back home</Button>
        <Button colorScheme="green" onClick={handleRecordMore}>Record more sentences</Button>
      </Box>
    </Box>
  );
};

export default RecordingsCompleted;
