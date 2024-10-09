import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddExampleButton = ({
  append,
}: {
  append: (value: Partial<Record<string, any>> | Partial<Record<string, any>>[], shouldFocus?: boolean) => void;
}): ReactElement => (
  <Box className="w-full flex flex-row justify-end flex-1" my={6}>
    <Button width="full" variant="primary" aria-label="Add Sentence" onClick={append} leftIcon={<AddIcon />}>
      Add Sentence
    </Button>
  </Box>
);

export default AddExampleButton;
