import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  SimpleForm,
  TextField,
  FunctionField,
  TextInput,
  NumberInput,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
  EditProps,
  CreateProps,
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import Icon from '@material-ui/icons/Spellcheck';
import { approvalAndDenialsFormatter } from 'src/shared/utils';
import {
  CompleteExamplePreview,
  BulkSuggestionActions,
  EditToolbar,
  ArrayInput,
  ExampleShow as Show,
  ExampleSuggestionCreate as Create,
  ExampleSuggestionEdit as Edit,
  IdField,
  Select,
  ArrayPreview,
  ReviewPreview,
  ListActions,
  Pagination,
  SourceField,
} from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import Empty from '../Empty';

export const ExampleSuggestionIcon = Icon;

export const ExampleSuggestionList = (props: ListProps): React.ReactElement => {
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

const ExampleSuggestionTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Example Suggestion '}
    {record ? `"${record.igbo || record.english}"` : ''}
  </span>
);

export const ExampleSuggestionShow = (props: ShowProps): ReactElement => (
  <Show title={<ExampleSuggestionTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export const ExampleSuggestionEdit = (props: EditProps): ReactElement => (
  <Edit title={<ExampleSuggestionTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
      <TextInput disabled label="Id" source="id" />
      <TextInput disabled label="Original Example Id" source="originalExampleId" />
      <TextInput label="Igbo" source="igbo" />
      <TextInput label="English" source="english" />
      <ArrayInput label="All Associated Word Ids" individualLabel="Associated Word Id" source="associatedWords" />
      <NumberInput disabled label="Approvals" format={approvalAndDenialsFormatter} source="approvals" />
      <NumberInput disabled label="Denials" format={approvalAndDenialsFormatter} source="denials" />
      <RichTextInput label="Editors' Notes" source="details" />
    </SimpleForm>
  </Edit>
);

export const ExampleSuggestionCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Example Suggestion" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);
