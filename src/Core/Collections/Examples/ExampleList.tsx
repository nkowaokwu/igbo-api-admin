import React, { ReactElement } from 'react';
import { List, Datagrid, TextField, Responsive, ListProps } from 'react-admin';
import {
  CompleteExamplePreview,
  ArrayPreview,
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
            <Select collection={Collection.EXAMPLES} permissions={permissions} />
            <CompleteExamplePreview label="Example Status" />
            <TextField label="Igbo" source="source.text" />
            <TextField label="English" source="translations.0.text" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.EXAMPLES} permissions={permissions} />
            <CompleteExamplePreview label="Example Status" />
            <StyleField label="Style" source="style" />
            <TextField label="Igbo" source="source.text" />
            <TextField label="English" source="translations.0.text" />
            <ArrayPreview label="Associated Words" source="associatedWords" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default ExampleList;
