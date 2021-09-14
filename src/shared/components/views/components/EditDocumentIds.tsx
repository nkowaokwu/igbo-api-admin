import React, { ReactElement } from 'react';
import { DocumentIdsProps } from '../../../interfaces';

const EditDocumentIds = ({
  collection,
  originalId,
  id,
  title,
}: DocumentIdsProps): ReactElement => (
  <div className="flex flex-col lg:flex-row lg:space-x-2">
    <div className="flex items-center">
      <h1 className="text-l text-gray-600 mr-3">Id:</h1>
      <h2 className="text-l text-gray-800">{id}</h2>
    </div>
    <div className="flex items-center">
      <h1 className="text-l text-gray-600 mr-3">{title}</h1>
      <h2 className="text-l text-gray-800">
        {originalId ? (
          <a
            className="link"
            href={`#/${collection}/${originalId}/show`}
          >
            {originalId}
          </a>
        ) : (
          'N/A'
        )}
      </h2>
    </div>
  </div>
);

export default EditDocumentIds;
