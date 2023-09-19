import React, { ReactElement } from 'react';
import { get, merge } from 'lodash';
import { Box, Heading } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import Collection from 'src/shared/constants/Collection';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import DiffField from '../diffFields/DiffField';
import FormHeader from '../../components/FormHeader';

const Attributes = ({
  title,
  record,
  diffRecord,
  attributeType,
}: {
  title?: string;
  record: Interfaces.Word | Interfaces.NsibidiCharacter;
  diffRecord: any;
  attributeType: Collection;
}): ReactElement => {
  const Attributes = attributeType === Collection.NSIBIDI_CHARACTERS ? NsibidiCharacterAttributes : WordAttributes;
  const defaultAttributes = Object.keys(Attributes).reduce(
    (finalDefault, attribute) => ({
      ...finalDefault,
      [attribute]: false,
    }),
    {},
  );
  return (
    <Box className="space-y-3 bg-gray-200 rounded-md p-3 mt-6 lg:mt-0" style={{ height: 'fit-content' }}>
      <FormHeader title={title || 'Word Attributes'} />
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Object.entries(merge(defaultAttributes, get(record, 'attributes') || {})).map(([attribute, value]) => (
          <Box>
            <Heading fontSize="lg" className="text-xl text-gray-600">
              {Attributes[attribute].label}
            </Heading>
            <DiffField
              path={`attributes.${attribute}`}
              diffRecord={diffRecord}
              fallbackValue={value}
              renderNestedObject={(value) => <span>{String(value || false)}</span>}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Attributes;
