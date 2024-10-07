import { Badge } from '@chakra-ui/react';
import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps, FunctionField } from 'react-admin';
import EntityStatusBadge from 'src/backend/shared/constants/EntityStatusBadge';
import { Select, ListActions, Pagination } from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import Empty from '../../Empty';

const ProjectList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      actions={<ListActions />}
      bulkActionButtons={false}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.PROJECTS} permissions={permissions} />
            <TextField label="Title" source="title" />
            <FunctionField
              label="Status"
              source="status"
              render={(record, source) => (
                <Badge colorScheme={EntityStatusBadge[record[source]]?.colorScheme || ''}>{record[source]}</Badge>
              )}
            />
            {/* <ArrayPreview label="Types" source="types" /> */}
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.PROJECTS} permissions={permissions} />
            <TextField label="Title" source="title" />
            <FunctionField
              label="Status"
              source="status"
              render={(record, source) => (
                <Badge colorScheme={EntityStatusBadge[record[source]]?.colorScheme || ''}>{record[source]}</Badge>
              )}
            />
            <TextField label="Description" source="description" />
            <TextField label="Project Id" source="id" />
            {/* <ArrayPreview label="Types" source="types" /> */}
          </Datagrid>
        }
      />
    </List>
  );
};

export default ProjectList;
