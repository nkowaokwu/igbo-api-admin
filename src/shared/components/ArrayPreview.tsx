import React, { ReactElement } from 'react';
import { get, truncate } from 'lodash';
import { Text, Tooltip, chakra } from '@chakra-ui/react';
import WordClass from 'src/backend/shared/constants/WordClass';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import { ArrayPreviewProps } from '../interfaces';

/* Builds the list of preview items */
const populateList = (items = [], source) => {
  if (!items?.length) {
    return [];
  }
  const isResolvable = source === 'stems' || source === 'associatedWords' || source === 'radicals';
  const isWord = source === 'stems' || source === 'associatedWords';
  const isDefinitions = source === 'definitions';
  const itemsPreview = items.slice(0, 10).map((item) => (
    <li className="list-disc" key={item}>
      {isResolvable && isWord ? (
        <ResolvedWord wordId={item?.id || item} />
      ) : isResolvable && !isWord ? (
        <ResolvedNsibidiCharacter nsibidiCharacterId={item?.id || item} />
      ) : isDefinitions ? (
        <>
          <Text className="italic text-gray-700">
            {get(item, 'text') || get(WordClass[item.wordClass], 'label') || '[MISSING DATA]'}
            {get(item, 'nsibidi') ? (
              <Tooltip label={get(item, 'nsibidi')}>
                <chakra.span className="akagu not-italic cursor-default" ml={3}>
                  {get(item, 'nsibidi')}
                </chakra.span>
              </Tooltip>
            ) : null}
          </Text>
          {(item.definitions || []).map((definition) => (
            <Text>{truncate(definition, { length: 120 }) || 'no definition'}</Text>
          ))}
        </>
      ) : (
        truncate(item?.text || item, { length: 120 })
      )}
    </li>
  ));

  if (items.length > itemsPreview.length) {
    itemsPreview.push(
      <li className="font-bold" key="final-list-key">
        {`${items.length - itemsPreview.length} more ${source}`}
      </li>,
    );
  }
  return itemsPreview;
};

/* Final list of preview items */
const ArrayPreview = ({ source, record = {} }: ArrayPreviewProps): ReactElement => (
  <ul data-test={`${source}-preview`}>{populateList(record && record[source], source)}</ul>
);

export default ArrayPreview;
