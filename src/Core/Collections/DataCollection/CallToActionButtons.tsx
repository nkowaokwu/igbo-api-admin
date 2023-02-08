import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';

const CallToActionButtons = (): ReactElement => {
  const navigateToRecordAudio = () => null;
  const navigateToVerifyAudio = () => null;
  return (
    <Box>
      <Button colorScheme="green" className="m-4" onClick={navigateToRecordAudio}>
        Record audio
      </Button>
      <Button colorScheme="green" className="m-4" onClick={navigateToVerifyAudio}>
        Verify audio
      </Button>
    </Box>
  );
};

export default CallToActionButtons;
