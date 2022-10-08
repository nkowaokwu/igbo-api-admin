import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, Tag, Tooltip } from '@chakra-ui/react';

/* Renders or not current word is a Constructed Term */
const ConstructedTermPreview = (
  { record }:
  { record: { attributes: { isConstructedTerm: boolean } } | Record },
) : ReactElement => (
  <Box data-test="constructer-term-cell" className="flex w-full justify-center items-center cursor-default">
    {record.attributes.isConstructedTerm ? (
      <Tooltip label="This term is a newly created word from our in-house team">
        <Tag colorScheme="blue" className="text-center">Constructed Term</Tag>
      </Tooltip>
    ) : null}
  </Box>
);

export default ConstructedTermPreview;
