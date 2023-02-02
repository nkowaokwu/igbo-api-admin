import React from 'react';
import {
  List,
  Datagrid,
  ListProps,
  TextField,
} from 'react-admin';
import {
  ListActions,
  Pagination,
} from 'src/shared/components';
import Empty from '../../Empty';

const DataCollectionList = (props: ListProps): React.ReactElement => (
  <List
    {...props}
    title="Data Collection"
    actions={<ListActions />}
    pagination={<Pagination />}
    empty={<Empty showCreate={false} />}
  >
    <Datagrid>
      <TextField label="Title" source="title" />
    </Datagrid>
  </List>
);

export default DataCollectionList;
