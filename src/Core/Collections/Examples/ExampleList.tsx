import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  TextField,
  Responsive,
  ListProps,
} from 'react-admin';
import {
  CompleteExamplePreview,
  ArrayPreview,
  IdField,
  ListActions,
  Pagination,
  Select,
  StyleField,
} from 'src/shared/components';
import Empty from '../../Empty';

const ExampleList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      actions={<ListActions />}
      bulkActionButtons={false}
      pagination={<Pagination />}
      empty={<Empty />}
    >
      <Responsive
        small={(
          <Datagrid>
            <CompleteExamplePreview label="Example Status" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <CompleteExamplePreview label="Example Status" />
            <StyleField label="Style" source="style" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <ArrayPreview label="Associated Words" source="associatedWords" />
            <IdField label="Id" source="id" />
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

export default ExampleList;
