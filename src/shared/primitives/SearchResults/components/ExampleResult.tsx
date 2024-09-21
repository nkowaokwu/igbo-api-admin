import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import { Example, ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';

const ExampleResult = ({
  result,
  'data-test': dataTest,
}: {
  result: Example | ExampleSuggestion;
  'data-test': string;
}): ReactElement => (
  <Box data-test={dataTest}>
    <Text fontWeight="bold">{get(result, 'source.text')}</Text>
    <Text fontStyle="italic" color="gray.400" fontSize="sm" fontWeight="normal" ml={3}>
      {get(result, 'translations.0.text')}
    </Text>
  </Box>
);

export default ExampleResult;
