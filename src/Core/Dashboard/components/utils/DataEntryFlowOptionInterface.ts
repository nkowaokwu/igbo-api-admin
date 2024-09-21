import { JSXElementConstructor, ReactElement } from 'react';
import Collection from 'src/shared/constants/Collection';

export enum DataEntryFlowGroup {
  GET_STARTED = 'GET_STARTED',
  CREATE_DATA = 'CREATE_DATA',
  EDIT_DATA = 'EDIT_DATA',
}

export interface DataEntryFlowOption {
  key: Collection;
  icon: string | ReactElement | JSXElementConstructor<any>;
  title: string;
  subtitle: string;
  hash: string;
  buttonLabel: string;
  group: DataEntryFlowGroup;
}
