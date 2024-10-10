import React from 'react';
import { List, Datagrid, TextField, FunctionField, Responsive, ListProps } from 'react-admin';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import {
  CompleteExamplePreview,
  BulkSuggestionActions,
  Select,
  ArrayPreview,
  ReviewPreview,
  ListActions,
  Pagination,
  SourceField,
} from 'src/shared/components';
import Collection from 'src/shared/constants/Collection';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const ExampleSuggestionList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  const isIgboAPIProject = useIsIgboAPIProject();
  return (
    <List
      {...props}
      title="Sentence Drafts"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={
          <Datagrid>
            <Select collection={Collection.EXAMPLES} permissions={permissions} />
            {isIgboAPIProject ? <CompleteExamplePreview label="Example Status" /> : null}
            <ReviewPreview label="You Reviewed" />
            <TextField label="Source" source="source.text" />
            <TextField label="Destination" source="translations.0.text" />
          </Datagrid>
        }
        medium={
          <Datagrid>
            <Select collection={Collection.EXAMPLES} permissions={permissions} />
            {isIgboAPIProject ? <CompleteExamplePreview label="Sentence Status" /> : null}
            {isIgboAPIProject ? <SourceField label="Origin" source="origin" /> : null}
            <ReviewPreview label="You Reviewed" />
            <TextField label="Source" source="source.text" />
            <TextField label="Destination" source="translations.0.text" />
            {isIgboAPIProject ? <ArrayPreview label="Associated Words" source="associatedWords" /> : null}
            <FunctionField
              label="Approvals"
              render={(record) => <span data-test="approval">{record.approvals.length}</span>}
            />
            <FunctionField
              label="Denials"
              render={(record) => <span data-test="denial">{record.denials.length}</span>}
            />
          </Datagrid>
        }
      />
    </List>
  );
};

export default ExampleSuggestionList;
