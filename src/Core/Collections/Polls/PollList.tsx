import React, { ReactElement } from 'react';
import {
  ListProps,
  List,
  Datagrid,
  TextField,
  usePermissions,
} from 'react-admin';
import {
  Select,
  Pagination,
  ListActions,
} from 'src/shared/components';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import Collection from 'src/shared/constants/Collections';
import Empty from '../../Empty';

const PollList = (props: ListProps): ReactElement => {
  const { permissions = {} } = usePermissions();
  return (
    <List
      {...props}
      title="Constructed Term Polls"
      actions={<ListActions />}
      hasCreate
      bulkActionButtons={false}
      pagination={<Pagination />}
      empty={<Empty showCreate={hasAdminPermissions(permissions, true)} />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Datagrid>
        <TextField label="Igbo Word" source="igboWord" />
        <TextField label="Tweet body" source="text" />
        <Select collection={Collection.POLLS} label="Editor's Actions" permissions={permissions} />
      </Datagrid>
    </List>
  );
};

export default PollList;
