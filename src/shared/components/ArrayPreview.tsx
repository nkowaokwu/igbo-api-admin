import React, { ReactElement } from 'react';
import { truncate } from 'lodash';
import { ArrayPreviewProps } from '../interfaces';
import ResolvedWord from './ResolvedWord';

/* Builds the list of preview items */
const populateList = (items = [], source) => {
  if (!items?.length) {
    return [];
  }
  const isResolvable = source === 'stems' || source === 'associatedWords';
  const itemsPreview = items.slice(0, 10).map((item) => (
    <li className="list-disc" key={item}>
      {isResolvable ? (
        <ResolvedWord wordId={item} />
      ) : (
        truncate(item, { length: 120 })
      )}
    </li>
  ));

  if (items.length > itemsPreview.length) {
    itemsPreview.push((
      <li className="font-bold">
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
