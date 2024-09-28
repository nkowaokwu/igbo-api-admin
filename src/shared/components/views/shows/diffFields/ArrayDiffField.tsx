import React, { ReactElement } from 'react';
import { capitalize, get, has } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import { Word, Example } from 'src/backend/controllers/utils/interfaces';

const ArrayDiffField = ({
  recordField,
  recordFieldSingular,
  record,
  originalRecord,
  children = [],
  hideBullets = false,
  hideEmpty = false,
}: {
  recordField: string;
  recordFieldSingular: string;
  record: Word | Example;
  originalRecord: Word | Example;
  children: ReactElement[] | ReactElement;
  hideBullets?: boolean;
  hideEmpty?: boolean;
}): ReactElement => {
  // If we have examples, we want to use the current record examples array instead of
  // getting the longest one
  const longestRecordField =
    (recordField === 'examples'
      ? get(record, recordField)
      : !originalRecord || !has(originalRecord, recordField)
      ? get(record, recordField)
      : get(originalRecord, recordField)?.length > get(record, recordField)?.length
      ? get(originalRecord, recordField)
      : get(record, recordField)) || [];

  return longestRecordField?.length ? (
    longestRecordField?.map((value, index) => (
      <Box
        // eslint-disable-next-line react/no-array-index-key
        key={`array-diff-field-${recordFieldSingular}-${index}`}
        className="flex flex-row items-start space-x-2 mt-4"
        data-test={`${recordFieldSingular}-${index}`}
      >
        {!hideBullets ? <h2 className="text-xl text-gray-600">{`${index + 1}. `}</h2> : null}
        {React.Children.map(children, (child) => React.cloneElement(child, { value, index }))}
      </Box>
    ))
  ) : !hideEmpty ? (
    <Text className="text-gray-500 italic">{`No ${capitalize(recordField)}`}</Text>
  ) : null;
};

export default ArrayDiffField;
