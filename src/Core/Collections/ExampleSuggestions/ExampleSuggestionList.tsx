import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  Responsive,
  ListProps,
} from 'react-admin';
import {
  CompleteExamplePreview,
  BulkSuggestionActions,
  IdField,
  Select,
  ArrayPreview,
  ReviewPreview,
  ListActions,
  Pagination,
  SourceField,
} from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const ExampleSuggestionList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Example Suggestions"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid>
            <CompleteExamplePreview label="Example Status" />
            <ReviewPreview label="You Reviewed" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <CompleteExamplePreview label="Example Status" />
            <SourceField label="Source" source="source" />
            <ReviewPreview label="You Reviewed" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <ArrayPreview label="Associated Words" source="associatedWords" />
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
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

export default ExampleSuggestionList;
