import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import Icon from '@material-ui/icons/Spellcheck';

export const ExampleSuggestionIcon = Icon;

export const ExampleSuggestionTitle = ({ record }: Record): ReactElement => (
  <span>
    {'Example Suggestion '}
    {record ? `"${record.igbo || record.english}"` : ''}
  </span>
);
