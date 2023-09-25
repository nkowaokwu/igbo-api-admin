import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Text, chakra } from '@chakra-ui/react';
import { Word } from 'src/backend/controllers/utils/interfaces';

const WordResult = ({ result, 'data-test': dataTest }: { result: Word; 'data-test': string }): ReactElement => (
  <Box data-test={dataTest}>
    <Text fontWeight="bold">
      {get(result, 'word')}
      <chakra.span fontStyle="italic" color="gray.400" fontSize="sm" fontWeight="normal" ml={3}>
        {get(result, 'definitions[0].wordClass')}
      </chakra.span>
    </Text>
    <Text color="gray.600">{get(result, 'definitions[0].definitions[0]')}</Text>
  </Box>
);

export default WordResult;
