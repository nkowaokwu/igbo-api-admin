import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  DateField,
  EmailField,
  TextField,
  Responsive,
  ListProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Person';
import {
  Select,
} from '../../shared/components';

export const UserIcon = Icon;

export const UserList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List {...props} actions={null} bulkActionButtons={false}>
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
            <DateField label="Last Long In" source="lastSignInTime" />
            <Select collection="user" label="Admin's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};
