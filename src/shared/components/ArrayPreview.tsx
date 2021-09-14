import React, { ReactElement } from 'react';
import { truncate } from 'lodash';
import { ArrayPreviewProps } from '../interfaces';

/* Builds the list of preview items */
const populateList = (items = []) => {
  if (!items?.length) {
    return [];
  }
  const itemsPreview = items.slice(0, 10).map((item) => (
    <li className="list-disc" key={item}>{truncate(item, { length: 120 })}</li>
  ));

  if (items.length > itemsPreview.length) {
    itemsPreview.push((
      <li className="font-bold">
        {`${items.length - itemsPreview.length} more definitions`}
      </li>
    ));
  }
  return itemsPreview;
};

/* Final list of preview items */
const ArrayPreview = ({ source, record = {} }: ArrayPreviewProps): ReactElement => (
  <ul data-test={`${source}-preview`}>{populateList(record && record[source])}</ul>
);

export default ArrayPreview;
