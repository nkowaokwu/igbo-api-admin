import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps, UrlField } from 'react-admin';
import { BulkSuggestionActions, Select, ListActions, Pagination } from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const TextImageList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Igbo Text Images"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty showCreate={false} />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.TEXT_IMAGES} permissions={permissions} />
            <TextField label="Igbo transcription" source="igbo" defaultValue="N/A" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.TEXT_IMAGES} permissions={permissions} />
            <TextField label="Igbo transcription" source="igbo" defaultValue="N/A" />
            <UrlField label="Media URL" source="media" defaultValue="N/A" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default TextImageList;
