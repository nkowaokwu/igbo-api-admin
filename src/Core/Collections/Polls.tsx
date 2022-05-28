import React, { ReactElement } from 'react';
import {
  SimpleForm,
  CreateProps,
  ListProps,
  List,
  Datagrid,
  TextField,
  Responsive,
} from 'react-admin';
import {
  TweetField,
  Pagination,
  PollsCreate as Create,
  ListActions,
} from 'src/shared/components';
import Empty from '../Empty';

export const PollsList = (props: ListProps): ReactElement => (
  <List
    {...props}
    title="Constructed Term Polls"
    actions={<ListActions />}
    hasCreate
    pagination={<Pagination />}
    empty={<Empty />}
    sort={{ field: 'approvals', order: 'DESC' }}
  >
    <Responsive
      small={(
        <Datagrid>
          <TextField label="Word" source="word" />
          <TweetField label="Constructed Term" source="constructedTerm" />
          <TweetField label="Definition" source="definition" />
        </Datagrid>
      )}
      medium={(
        <Datagrid>
          <TextField label="Constructed Term" source="constructedTerm" />
          <TextField label="English Term" source="englishTerm" />
          <TextField label="Definitions" source="definition" />
          <TweetField label="Tweet Link" source="id" />
        </Datagrid>
      )}
    />
  </List>
);

export const PollsCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Constructed Term Poll" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);
