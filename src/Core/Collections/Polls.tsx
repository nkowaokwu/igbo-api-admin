import React, { ReactElement } from 'react';
import {
  SimpleForm,
  CreateProps,
  ListProps,
  List,
  Datagrid,
  TextField,
} from 'react-admin';
import {
  TweetField,
  Pagination,
  PollsCreate as Create,
  ListActions,
} from 'src/shared/components';
import { Role } from 'src/shared/constants/auth-types';
import Empty from '../Empty';

export const PollsList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Constructed Term Polls"
      actions={<ListActions />}
      hasCreate
      pagination={<Pagination />}
      empty={<Empty showCreate={permissions.role === Role.ADMIN} />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Datagrid>
        <TextField label="Tweet body" source="text" />
        <TweetField label="Tweet Link" source="id" />
      </Datagrid>
    </List>
  );
};

export const PollsCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Constructed Term Poll" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);
