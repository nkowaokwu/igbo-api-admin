import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  SimpleForm,
  FunctionField,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
  EditProps,
  CreateProps,
} from 'react-admin';
import Icon from '@material-ui/icons/Spellcheck';
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
  WordShow as Show,
  WordSuggestionCreate as Create,
  WordSuggestionEdit as Edit,
} from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../Empty';

export const WordSuggestionIcon = Icon;

export const WordSuggestionList = (props: ListProps): ReactElement => {
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
            <ReviewPreview label="Already Reviewed" />
            <HeadwordField label="Headword" source="word" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid expand={<WordPanel />}>
            <SourceField label="Source" source="source" />
            <CompleteWordPreview label="Word Status" />
            <ReviewPreview label="Already Reviewed" />
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

const WordSuggestionTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Word Suggestion '}
    {record ? `"${record.word}"` : ''}
  </span>
);

export const WordSuggestionShow = (props: ShowProps): ReactElement => (
  <Show title={<WordSuggestionTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export const WordSuggestionEdit = (props: EditProps): ReactElement => (
  <Edit title={<WordSuggestionTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Edit>
);

export const WordSuggestionCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Word Suggestion" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);
