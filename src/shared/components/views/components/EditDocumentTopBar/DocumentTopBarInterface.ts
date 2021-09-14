import { Key } from 'react';
import { Record } from 'react-admin';

interface DocumentTopBar {
  record: Record,
  resource: string,
  view: string,
  id?: Key,
  title: string,
  push: (value: any) => void,
  permissions: any,
};

export default DocumentTopBar;
