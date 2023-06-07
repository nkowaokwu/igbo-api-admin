import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddExampleButton = (
  { append }:
  {
    append: (value: Partial<Record<string, any>> | Partial<Record<string, any>>[], shouldFocus?: boolean) => void
  },
): ReactElement => (
  <Box className="w-full flex flex-row justify-end" my={6}>
    <Button
      colorScheme="green"
      aria-label="Add Example"
      onClick={append}
      leftIcon={<AddIcon />}
    >
      Add Example
    </Button>
  </Box>
);

export default AddExampleButton;
