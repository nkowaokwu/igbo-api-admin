import React, { ReactElement } from 'react';
import { List, Datagrid, TextField, Responsive, ListProps } from 'react-admin';
import {
  CompleteExamplePreview,
  ArrayPreview,
  IdField,
  ListActions,
  Pagination,
  Select,
  StyleField,
} from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import Empty from '../../Empty';

const ExampleList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List {...props} actions={<ListActions />} bulkActionButtons={false} pagination={<Pagination />} empty={<Empty />}>
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.EXAMPLES} label="Editor's Actions" permissions={permissions} />
            <CompleteExamplePreview label="Example Status" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.EXAMPLES} label="Editor's Actions" permissions={permissions} />
            <CompleteExamplePreview label="Example Status" />
            <StyleField label="Style" source="style" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <ArrayPreview label="Associated Words" source="associatedWords" />
            <IdField label="Id" source="id" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default ExampleList;
