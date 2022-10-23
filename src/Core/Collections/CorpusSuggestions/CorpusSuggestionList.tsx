import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
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

const ExampleSuggestionList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Corpus Suggestions"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid>
            <ReviewPreview label="You Reviewed" />
            <TextField label="Title" source="title" />
            <UrlField label="Media URL" source="media" />
            <Select collection={Collection.CORPUS_SUGGESTIONS} label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <ReviewPreview label="You Reviewed" />
            <TextField label="Title" source="title" />
            <UrlField label="Media URL" source="media" />
            <FunctionField
              label="Approvals"
              render={(record) => (
                <span data-test="approval">{record.approvals.length}</span>
              )}
            />
            <FunctionField
              label="Denials"
              render={(record) => (
                <span data-test="denial">{record.denials.length}</span>
              )}
            />
            <IdField label="Id" source="id" />
            <Select collection={Collection.CORPUS_SUGGESTIONS} label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

export default ExampleSuggestionList;
