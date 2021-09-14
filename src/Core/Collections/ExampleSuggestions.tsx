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
import { approvalAndDenialsFormatter } from '../../shared/utils';
import {
  EditToolbar,
  ArrayInput,
  ExampleShow as Show,
  ExampleSuggestionCreate as Create,
  ExampleSuggestionEdit as Edit,
  Select,
  ArrayPreview,
  ReviewPreview,
  ListActions,
  Pagination,
} from '../../shared/components';
import Empty from '../Empty';

export const ExampleSuggestionIcon = Icon;

export const ExampleSuggestionList = (props: ListProps): React.ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Example Suggestions"
      actions={<ListActions />}
      pagination={<Pagination />}
      empty={<Empty />}
      bulkActionButtons={false}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid>
            <ReviewPreview label="Already Reviewed" />
            <TextField label="Igbo" source="igbo" />
            <TextField label="English" source="english" />
            <Select collection="examples" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <ReviewPreview label="Already Reviewed" />
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
            <TextField label="Id" source="id" />
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
