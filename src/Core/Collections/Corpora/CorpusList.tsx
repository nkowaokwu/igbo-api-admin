import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Responsive,
  ListProps,
  UrlField,
} from 'react-admin';
import {
  BulkSuggestionActions,
  IdField,
  Select,
  ReviewPreview,
  ListActions,
  Pagination,
} from 'src/shared/components';
import Collection from 'src/shared/constants/Collections';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const CorpusSuggestionList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Corpus Suggestions"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty showCreate={false} />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid>
            <ReviewPreview label="You Reviewed" />
            <TextField label="Title" source="title" />
            <UrlField label="Media URL" source="media" />
            <Select collection={Collection.CORPORA} label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <ReviewPreview label="You Reviewed" />
            <TextField label="Title" source="title" />
            <UrlField label="Media URL" source="media" />
            <IdField label="Id" source="id" />
            <Select collection={Collection.CORPORA} label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

export default CorpusSuggestionList;
