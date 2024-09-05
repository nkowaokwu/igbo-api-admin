import React, { ReactElement } from 'react';
import { ListProps, List, Datagrid, TextField, usePermissions } from 'react-admin';
import { Select, Pagination, ListActions } from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Collection from 'src/shared/constants/Collection';
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
      empty={<Empty showCreate={hasAdminOrMergerPermissions(permissions, true)} />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Datagrid>
        <Select collection={Collection.POLLS} permissions={permissions} />
        <TextField label="Igbo Word" source="igboWord" />
        <TextField label="Tweet body" source="text" />
      </Datagrid>
    </List>
  );
};

export default PollList;
