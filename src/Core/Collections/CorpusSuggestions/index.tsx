import React, { ReactElement } from 'react';
import { Record } from 'react-admin';

export const CorpusSuggestionTitle = ({ record }: Record): ReactElement => (
  <span>
    {'Corpus Suggestion '}
    {record ? `"${record.title}"` : ''}
  </span>
);
