import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddExampleButton = (
  { examples, setExamples }:
  { examples: { igbo: string, english: string }[], setExamples: (array) => void },
): ReactElement => (
  <Box className="w-full flex flex-row justify-end" mt={3}>
    <Button
      colorScheme="green"
      aria-label="Add Example"
      onClick={() => {
        const updateExamples = [...examples];
        updateExamples.push({ igbo: '', english: '' });
        setExamples(updateExamples);
      }}
      leftIcon={<AddIcon />}
    >
      Add Example
    </Button>
  </Box>
);

export default AddExampleButton;
