import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps, BooleanField } from 'react-admin';
import { ListActions, Pagination, ShowNotificationButtonField } from 'src/shared/components';
import Empty from '../../Empty';

const NotificationList = (props: ListProps): React.ReactElement => (
  <List
    {...props}
    title="Platform Notifications"
    actions={<ListActions />}
    pagination={<Pagination />}
    empty={<Empty showCreate={false} />}
    sort={{ field: 'approvals', order: 'DESC' }}
  >
    <Responsive
      small={
        <Datagrid>
          <ShowNotificationButtonField source="link" />
          <TextField label="Title" source="title" />
          <TextField label="Sender" source="initiator.displayName" />
        </Datagrid>
      }
      medium={
        <Datagrid>
          <ShowNotificationButtonField source="link" />
          <TextField label="Title" source="title" />
          <TextField label="Message" source="message" defaultValue="N/A" />
          <BooleanField label="Opened" source="opened" defaultValue="Platform" />
          <TextField label="Sender" source="initiator.displayName" />
        </Datagrid>
      }
    />
  </List>
);

export default NotificationList;
