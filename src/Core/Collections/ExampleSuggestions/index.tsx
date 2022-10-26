import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import Icon from '@mui/icons-material/Spellcheck';

export const ExampleSuggestionIcon = Icon;

export const ExampleSuggestionTitle = ({ record }: Record): ReactElement => (
  <span>
    {'Example Suggestion '}
    {record ? `"${record.igbo || record.english}"` : ''}
  </span>
);
