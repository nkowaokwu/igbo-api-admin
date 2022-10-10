import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Responsive,
  ListProps,
  BooleanField,
} from 'react-admin';
import {
  ListActions,
  Pagination,
  ShowNotificationButtonField,
} from 'src/shared/components';
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
      small={(
        <Datagrid>
          <TextField label="Title" source="title" />
          <TextField label="Sender" source="initiator.displayName" />
          <ShowNotificationButtonField source="link" />
        </Datagrid>
      )}
      medium={(
        <Datagrid>
          <TextField label="Title" source="title" />
          <TextField label="Message" source="message" />
          <BooleanField label="Opened" source="opened" />
          <TextField label="Sender" source="initiator.displayName" />
          <ShowNotificationButtonField source="link" />
        </Datagrid>
      )}
    />
  </List>
);

export default NotificationList;
