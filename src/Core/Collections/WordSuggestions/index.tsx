import React, { ReactElement } from 'react';
import Icon from '@mui/icons-material/Spellcheck';

export const WordSuggestionIcon = Icon;

export const WordSuggestionTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Word Suggestion '}
    {record ? `"${record.word}"` : ''}
  </span>
);
