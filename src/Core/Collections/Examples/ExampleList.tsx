import React, { ReactElement } from 'react';
import { List, Datagrid, TextField, Responsive, ListProps } from 'react-admin';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
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
  const isIgboAPIProject = useIsIgboAPIProject();
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
            <Select collection={Collection.EXAMPLES} permissions={permissions} />
            {isIgboAPIProject ? <CompleteExamplePreview label="Example Status" /> : null}
            <TextField label="Source" source="source.text" />
            <TextField label="Destination" source="translations.0.text" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.EXAMPLES} permissions={permissions} />
            {isIgboAPIProject ? <CompleteExamplePreview label="Example Status" /> : null}
            {isIgboAPIProject ? <StyleField label="Style" source="style" /> : null}
            <TextField label="Source" source="source.text" />
            <TextField label="Destination" source="translations.0.text" />
            {isIgboAPIProject ? <ArrayPreview label="Associated Words" source="associatedWords" /> : null}
          </Datagrid>
        }
      />
    </List>
  );
};

export default ExampleList;
