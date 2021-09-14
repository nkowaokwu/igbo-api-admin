import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { has } from 'lodash';
import { Box, Text } from '@chakra-ui/react';

const ArrayDiffField = (
  {
    recordField,
    recordFieldSingular,
    record,
    originalWordRecord,
    children = [],
  }
  : {
    recordField: string,
    recordFieldSingular: string,
    record: Record,
    originalWordRecord: Record,
    children: ReactElement[],
  },
): ReactElement => {
  const longestRecordField = !originalWordRecord || !has(originalWordRecord, recordField)
    ? record[recordField]
    : originalWordRecord[recordField]?.length > record[recordField]?.length
      ? originalWordRecord[recordField]
      : record[recordField];

  return longestRecordField?.length ? longestRecordField?.map((value, index) => (
    <Box
      // eslint-disable-next-line react/no-array-index-key
      key={`array-diff-field-${recordFieldSingular}-${index}`}
      className="flex flex-row items-center space-x-2"
      data-test={`${recordFieldSingular}-${index}`}
    >
      <h2 className="text-2xl text-gray-600">{`${index + 1}. `}</h2>
      {React.Children.map(children, (child) => (
        React.cloneElement(child, { value, index })
      ))}
    </Box>
  )) : <Text className="text-gray-500 italic">{`No ${recordField}`}</Text>;
};

export default ArrayDiffField;
