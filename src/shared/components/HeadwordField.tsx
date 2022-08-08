import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import generateFlags from 'src/shared/utils/flagHeadword';

const HeadwordField = ({ record, source }: { record?: Record, source: string }): ReactElement => {
  const { nsibidi } = record;
  const headword = record[source];
  const hasFlags = !!Object.values(generateFlags({ word: record, flags: {} }).flags).length;
  return (
    <>
      {nsibidi ? <Text fontSize="md" className="akagu text-green-800">{nsibidi}</Text> : null}
      <Tooltip
        backgroundColor="orange.300"
        color="gray.800"
        label={hasFlags
          ? 'This word has been flagged as invalid due to the headword not '
            + 'following the Dictionary Editing Standards document. Please edit this word for more details.'
          : ''}
      >
        <Box className="flex flex-row items-center cursor-default">
          {hasFlags ? <WarningIcon color="orange.600" boxSize={3} mr={2} /> : null}
          <Text color={hasFlags ? 'orange.600' : ''}>{headword}</Text>
        </Box>
      </Tooltip>
    </>
  );
};

HeadwordField.defaultProps = {
  record: { nsibidi: '' },
};

export default HeadwordField;
