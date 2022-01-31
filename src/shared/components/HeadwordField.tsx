import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Text } from '@chakra-ui/react';

const HeadwordField = ({ record, source }: { record?: Record, source: string }): ReactElement => {
  const { nsibidi } = record;
  const headword = record[source];
  return (
    <>
      {nsibidi ? <Text fontSize="md" className="akagu text-green-800">{nsibidi}</Text> : null}
      <Text>{headword}</Text>
    </>
  );
};

HeadwordField.defaultProps = {
  record: { nsibidi: '' },
};

export default HeadwordField;
