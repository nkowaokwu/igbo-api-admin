import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, Tag, Tooltip } from '@chakra-ui/react';

/* Renders or not current word is Standard Igbo */
const StandardIgboPreview = (
  { record }:
  { record: { attributes: { isStandardIgbo: boolean } } | Record },
) : ReactElement => (
  <Box data-test="standard-igbo-cell" className="flex w-full justify-center items-center cursor-default">
    {record.attributes.isStandardIgbo ? (
      <Tooltip label="This term is in Standard Igbo">
        <Tag colorScheme="green" className="text-center">Standard Igbo</Tag>
      </Tooltip>
    ) : (
      <Tooltip label="This term is not in Standard Igbo">
        <Tag colorScheme="red" className="text-center">Not Standard</Tag>
      </Tooltip>
    )}
  </Box>
);

export default StandardIgboPreview;
