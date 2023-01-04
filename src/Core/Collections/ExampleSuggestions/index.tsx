import React, { ReactElement } from 'react';
import { Record } from 'react-admin';

export const ExampleSuggestionTitle = ({ record }: Record): ReactElement => (
  <span>
    {'Example Suggestion '}
    {record ? `"${record.igbo || record.english}"` : ''}
  </span>
);
