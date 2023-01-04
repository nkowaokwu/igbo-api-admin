import React, { ReactElement } from 'react';

export const WordSuggestionTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Word Suggestion '}
    {record ? `"${record.word}"` : ''}
  </span>
);
