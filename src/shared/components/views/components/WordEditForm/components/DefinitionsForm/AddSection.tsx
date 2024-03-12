import React, { ReactElement } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddSection = ({ label, onClick }: { label: string; onClick: () => void }): ReactElement => (
  <Box className="flex justify-center items-center bg-gray-200 py-6 px-4rounded mb-4 rounded-lg">
    <Button colorScheme="purple" aria-label="Add Definition" onClick={onClick} leftIcon={<AddIcon />}>
      {label}
    </Button>
  </Box>
);

export default AddSection;
