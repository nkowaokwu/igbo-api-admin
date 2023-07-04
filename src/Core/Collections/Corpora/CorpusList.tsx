import React from 'react';
import { List, Datagrid, TextField, Responsive, ListProps, UrlField } from 'react-admin';
import { BulkSuggestionActions, IdField, Select, ListActions, Pagination } from 'src/shared/components';
import Collection from 'src/shared/constants/Collections';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const CorpusSuggestionList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Corpora"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty showCreate={false} />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.CORPORA} label="Editor's Actions" permissions={permissions} />
            <TextField label="Title" source="title" />
            <UrlField label="Media URL" source="media" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.CORPORA} label="Editor's Actions" permissions={permissions} />
            <TextField label="Title" source="title" />
            <UrlField label="Media URL" source="media" />
            <IdField label="Id" source="id" />
          </Datagrid>
        }
      />
    </List>
  );
};

export default CorpusSuggestionList;
