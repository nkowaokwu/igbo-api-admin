import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  FunctionField,
  Responsive,
  ListProps,
} from 'react-admin';
import {
  ArrayPreview,
  BulkSuggestionActions,
  CompleteWordPreview,
  SourceField,
  HeadwordField,
  IdField,
  ListActions,
  Pagination,
  ReviewPreview,
  Select,
  WordClassTextField,
  WordPanel,
} from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../../Empty';

const WordSuggestionList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Word Suggestions"
      actions={<ListActions />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <BulkSuggestionActions />)}
      pagination={<Pagination />}
      empty={<Empty />}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid expand={<WordPanel />}>
            <CompleteWordPreview label="Word Status" />
            <ReviewPreview label="You Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid expand={<WordPanel />}>
            <SourceField label="Source" source="source" />
            <CompleteWordPreview label="Word Status" />
            <ReviewPreview label="You Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <WordClassTextField label="Part of Speech" source="wordClass" />
            <ArrayPreview label="Definitions" source="definitions" />
            <ArrayPreview label="Variations" source="variations" />
            {/* TODO: move these out to reusable component */}
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
            <IdField label="Origin Word Id" source="originalWordId" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

export default WordSuggestionList;
