import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import Icon from '@material-ui/icons/Spellcheck';

export const GenericWordIcon = Icon;

export const GenericWordTitle = ({ record }: Record): ReactElement => (
  <span>
    {'Generic Word '}
    {record ? `"${record.word}"` : ''}
  </span>
);
