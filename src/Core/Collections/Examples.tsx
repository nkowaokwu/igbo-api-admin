import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  TextField,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
} from 'react-admin';
import Icon from '@material-ui/icons/ChatBubble';
import {
  ArrayPreview,
  ExampleShow as Show,
  ListActions,
  Pagination,
  Select,
} from '../../shared/components';
import { ExampleShowActions } from '../../actions/exampleActions';
import Empty from '../Empty';

export const ExampleIcon = Icon;

export const ExampleList = (props: ListProps): ReactElement => {
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
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <ArrayPreview label="Associated Words" source="associatedWords" />
            <TextField label="Id" source="id" />
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

const ExampleTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Example '}
    {record ? `"${record.igbo || record.english}"` : ''}
  </span>
);

export const ExampleShow = (props: ShowProps): ReactElement => (
  <Show actions={<ExampleShowActions />} title={<ExampleTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);
