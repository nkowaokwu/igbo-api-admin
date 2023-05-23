import React, { ReactElement } from 'react';
import { get, truncate } from 'lodash';
import { Text, Tooltip, chakra } from '@chakra-ui/react';
import WordClass from 'src/backend/shared/constants/WordClass';
import { ArrayPreviewProps } from '../interfaces';
import ResolvedWord from './ResolvedWord';

/* Builds the list of preview items */
const populateList = (items = [], source) => {
  if (!items?.length) {
    return [];
  }
  const isResolvable = source === 'stems' || source === 'associatedWords';
  const isDefinitions = source === 'definitions';
  const itemsPreview = items.slice(0, 10).map((item) => (
    <li className="list-disc" key={item}>
      {isResolvable ? (
        <ResolvedWord wordId={item} />
      ) : isDefinitions ? (
        <>
          <Text className="italic text-gray-700">
            {get(WordClass[item.wordClass], 'label') || '[UPDATE PART OF SPEECH]'}
            {get(item, 'nsibidi') ? (
              <Tooltip label={get(item, 'nsibidi')}>
                <chakra.span className="akagu not-italic cursor-default" ml={3}>{get(item, 'nsibidi')}</chakra.span>
              </Tooltip>
            ) : null}
          </Text>
          {(item.definitions || []).map((definition) => (
            <Text>{truncate(definition, { length: 120 }) || 'no definition'}</Text>
          ))}
        </>
      ) : (
        truncate(item, { length: 120 })
      )}
    </li>
  ));

  if (items.length > itemsPreview.length) {
    itemsPreview.push((
      <li className="font-bold" key="final-list-key">
        {`${items.length - itemsPreview.length} more ${source}`}
      </li>
    ));
  }
  return itemsPreview;
};

/* Final list of preview items */
const ArrayPreview = ({ source, record = {} }: ArrayPreviewProps): ReactElement => (
  <ul data-test={`${source}-preview`}>{populateList(record && record[source], source)}</ul>
);

export default ArrayPreview;
