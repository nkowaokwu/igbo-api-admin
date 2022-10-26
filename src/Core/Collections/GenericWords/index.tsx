import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import Icon from '@mui/icons-material/Spellcheck';

export const GenericWordIcon = Icon;

export const GenericWordTitle = ({ record }: Record): ReactElement => (
  <span>
    {'Generic Word '}
    {record ? `"${record.word}"` : ''}
  </span>
);
