import { Badge } from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import { List, Datagrid, DateField, EmailField, TextField, Responsive, ListProps, FunctionField } from 'react-admin';
import EntityStatusBadge from 'src/backend/shared/constants/EntityStatusBadge';
import UserRoleLabels from 'src/backend/shared/constants/UserRoleLabels';
import { ListActions, Pagination, Select } from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';

const UserList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List {...props} actions={<ListActions />} bulkActionButtons={false} pagination={<Pagination />}>
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.USERS} permissions={permissions} />
            <TextField label="Name" source="displayName" defaultValue="No name" />
            <FunctionField label="Role" source="role" render={(_, source) => UserRoleLabels[source]?.label || source} />
            <FunctionField
              label="Status"
              source="status"
              render={(record, source) => (
                <Badge colorScheme={EntityStatusBadge[record[source]]?.colorScheme || ''}>{record[source]}</Badge>
              )}
            />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection="user" permissions={permissions} />
            <TextField label="Name" source="displayName" defaultValue="No name" />
            <EmailField label="Email" source="email" />
            <FunctionField
              label="Role"
              source="role"
              render={(record, source) => UserRoleLabels[record[source]]?.label || record[source]}
            />
            <FunctionField
              label="Status"
              source="status"
              render={(record, source) => (
                <Badge colorScheme={EntityStatusBadge[record[source]]?.colorScheme || ''}>{record[source]}</Badge>
              )}
            />
            <TextField label="Id" source="uid" />
            <DateField
              label="Last Log In"
              source="lastSignInTime"
              options={{
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }}
            />
          </Datagrid>
        }
      />
    </List>
  );
};

export default UserList;
