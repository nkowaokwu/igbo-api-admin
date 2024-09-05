import React, { ReactElement } from 'react';
import { List, Datagrid, DateField, EmailField, TextField, Responsive, ListProps } from 'react-admin';
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
            <EmailField label="email" source="Email" />
            <TextField label="Role" source="role" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection="user" permissions={permissions} />
            <TextField label="Name" source="displayName" defaultValue="No name" />
            <EmailField label="Email" source="email" />
            <TextField label="Role" source="role" />
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
