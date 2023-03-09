import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';

const AddExampleButton = ({
  examples,
  setExamples,
} : {
  examples: Omit<ExampleSuggestion, 'id'>[],
  setExamples: (array) => void,
}): ReactElement => (
  <Box className="w-full flex flex-row justify-end" my={6}>
    <Button
      width="full"
      colorScheme="green"
      aria-label="Add Example"
      onClick={() => {
        const updateExamples = [...examples];
        updateExamples.push({
          igbo: '',
          english: '',
          associatedDefinitionsSchemas: [],
          pronunciations: [],
        });
        setExamples(updateExamples);
      }}
      leftIcon={<AddIcon />}
    >
      Add Example
    </Button>
  </Box>
);

export default AddExampleButton;
