import React, { ReactElement } from 'react';
import { List, Datagrid, Responsive, ListProps } from 'react-admin';
import {
  ArrayPreview,
  CompleteWordPreview,
  HeadwordField,
  ListActions,
  Pagination,
  Select,
} from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import Empty from '../../Empty';

export const WordList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      actions={<ListActions />}
      bulkActionButtons={false}
      pagination={<Pagination />}
      empty={<Empty showCreate={false} />}
    >
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.WORDS} permissions={permissions} />
            <HeadwordField label="Headword" source="word" />
            <CompleteWordPreview label="Word Status" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.WORDS} permissions={permissions} />
            <CompleteWordPreview label="Word Status" />
            <HeadwordField label="Headword" source="word" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
            <ArrayPreview label="Stems" source="stems" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default WordList;
