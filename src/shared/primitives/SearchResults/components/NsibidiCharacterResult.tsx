import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Text, chakra } from '@chakra-ui/react';
import { NsibidiCharacter } from 'src/backend/controllers/utils/interfaces';

const NsibidiCharacterResult = ({
  result,
  'data-test': dataTest,
}: {
  result: NsibidiCharacter;
  'data-test': string;
}): ReactElement => (
  <Box data-test={dataTest}>
    <Text fontWeight="bold" className="akagu">
      {get(result, 'nsibidi')}
      <chakra.span fontStyle="italic" color="gray.400" fontSize="sm" fontWeight="normal" ml={3}>
        {get(result, 'pronunciation')}
      </chakra.span>
    </Text>
    <Text color="gray.600">{get(result, 'definitions[0].text')}</Text>
  </Box>
);

export default NsibidiCharacterResult;
