import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  SimpleShowLayout,
  DateField,
  EmailField,
  TextField,
  Responsive,
  ListProps,
  ShowProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Person';
import {
  ListActions,
  Pagination,
  Select,
  UserShow as Show,
} from 'src/shared/components';

export const UserIcon = Icon;

export const UserList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      actions={<ListActions />}
      bulkActionButtons={false}
      pagination={<Pagination />}
    >
      <Responsive
        small={(
          <Datagrid>
            <TextField label="Name" source="displayName" />
            <EmailField label="email" source="Email" />
            <TextField label="Role" source="role" />
            <TextField label="Editing Group" source="editingGroup" />
            <Select collection="users" label="Admin's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <TextField label="Name" source="displayName" />
            <EmailField label="Email" source="email" />
            <TextField label="Role" source="role" />
            <TextField label="Editing Group" source="editingGroup" />
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
            <Select collection="user" label="Admin's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

const UserTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>{`User ${record ? `"${record.firebaseId}"` : ''}`}</span>
);

export const UserShow = (props: ShowProps): ReactElement => (
  <Show
    title={<UserTitle />}
    {...props}
  >
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);
