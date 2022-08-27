import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, Tag } from '@chakra-ui/react';

/* Renders or not current word is Standard Igbo */
const StandardIgboPreview = (
  { record }:
  { record: { attributes: { isStandardIgbo: boolean } } | Record },
) : ReactElement => (
  <Box data-test="standard-igbo-cell" className="flex w-full justify-center items-center">
    {record.attributes.isStandardIgbo ? (
      <Tag colorScheme="green" className="text-center">Standard Igbo</Tag>
    ) : (
      <Tag colorScheme="red" className="text-center">Not Standard</Tag>
    )}
  </Box>
);

export default StandardIgboPreview;
