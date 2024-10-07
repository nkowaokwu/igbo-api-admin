import React, { ReactElement } from 'react';
import { get, merge } from 'lodash';
import { Box, Checkbox } from '@chakra-ui/react';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import WordAttributes from 'src/backend/shared/constants/WordAttributes';
import Collection from 'src/shared/constants/Collection';
import NsibidiCharacterAttributes from 'src/backend/shared/constants/NsibidiCharacterAttributes';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import { LuSquareStack } from 'react-icons/lu';

const Attributes = ({
  title,
  record,
  attributeType,
}: {
  title?: string;
  record: Interfaces.Word | Interfaces.NsibidiCharacter;
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
    <ShowTextRenderer title={title || 'Word Attributes'} icon={<LuSquareStack />}>
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Object.entries(merge(defaultAttributes, get(record, 'attributes') || {})).map(([attribute, value]) => (
          <Box>
            <Checkbox defaultChecked={value} pointerEvents="none">
              {Attributes[attribute].label}
            </Checkbox>
          </Box>
        ))}
      </Box>
    </ShowTextRenderer>
  );
};

export default Attributes;
