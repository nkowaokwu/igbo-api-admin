import React, { ReactElement } from 'react';
import { List, Datagrid, Responsive, ListProps } from 'react-admin';
import {
  ArrayPreview,
  CompleteWordPreview,
  HeadwordField,
  IdField,
  ListActions,
  Pagination,
  Select,
  WordPanel,
} from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import Empty from '../../Empty';

export const WordList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List {...props} actions={<ListActions />} bulkActionButtons={false} pagination={<Pagination />} empty={<Empty />}>
      <Responsive
        small={
          <Datagrid expand={<WordPanel />}>
            <Select collection={Collection.WORDS} label="Editor's Actions" permissions={permissions} />
            <CompleteWordPreview label="Word Status" />
            <HeadwordField label="Headword" source="word" />
          </Datagrid>
        }
        medium={
          <Datagrid expand={<WordPanel />}>
            <Select collection={Collection.WORDS} label="Editor's Actions" permissions={permissions} />
            <CompleteWordPreview label="Word Status" />
            <HeadwordField label="Headword" source="word" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
            <ArrayPreview label="Stems" source="stems" />
            <IdField label="Id" source="id" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default WordList;
