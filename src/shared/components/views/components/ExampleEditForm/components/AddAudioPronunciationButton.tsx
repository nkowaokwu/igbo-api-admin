import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddAudioPronunciationButton = ({
  onClick,
}: {
  onClick: (value: Partial<Record<string, any>> | Partial<Record<string, any>>[], shouldFocus?: boolean) => void;
}): ReactElement => (
  <Box className="w-full flex flex-row justify-end" my={6}>
    <Button width="full" colorScheme="purple" aria-label="Add Example" onClick={onClick} leftIcon={<AddIcon />}>
      Add Audio Pronunciation
    </Button>
  </Box>
);

export default AddAudioPronunciationButton;
