import React, { ReactElement } from 'react';
import {
  List,
  Datagrid,
  SimpleForm,
  TextField,
  NumberInput,
  TextInput,
  required,
  FunctionField,
  SimpleShowLayout,
  Responsive,
  ListProps,
  ShowProps,
  EditProps,
  BulkDeleteButton,
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import Icon from '@material-ui/icons/Spellcheck';
import { approvalAndDenialsFormatter } from 'src/shared/utils';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import {
  ArrayInput,
  ArrayPreview,
  ReviewPreview,
  EditToolbar,
  ListActions,
  Pagination,
  Select,
  WordShow as Show,
  WordSuggestionEdit as Edit,
} from 'src/shared/components';
import Empty from '../Empty';

export const GenericWordIcon = Icon;

const GenericWordsBulkActions = (props): ReactElement => (
  <BulkDeleteButton {...props} />
);

export const GenericWordList = (props: ListProps): ReactElement => {
  const { permissions } = props;
  return (
    <List
      {...props}
      title="Generic Words"
      actions={<ListActions />}
      pagination={<Pagination />}
      empty={<Empty />}
      bulkActionButtons={hasAdminOrMergerPermissions(permissions, <GenericWordsBulkActions />)}
      sort={{ field: 'approvals', order: 'DESC' }}
    >
      <Responsive
        small={(
          <Datagrid>
            <ReviewPreview label="Already Reviewed" />
            <TextField label="Word" source="word" />
            <ArrayPreview label="Definitions" source="definitions" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
        medium={(
          <Datagrid>
            <ReviewPreview label="Already Reviewed" />
            <TextField label="Word" source="word" />
            <TextField label="Part of Speech" source="wordClass" />
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
            <TextField label="Id" source="id" />
            <Select collection="words" label="Editor's Actions" permissions={permissions} />
          </Datagrid>
        )}
      />
    </List>
  );
};

const GenericWordTitle = ({ record }: Record<any, any>) => (
  <span>
    {'Generic Word '}
    {record ? `"${record.word}"` : ''}
  </span>
);

export const GenericWordShow = (props: ShowProps): ReactElement => (
  <Show title={<GenericWordTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export const GenericWordEdit = (props: EditProps): ReactElement => (
  <Edit title={<GenericWordTitle />} {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
      <TextInput disabled label="Id" source="id" />
      <TextInput label="Word" source="word" validate={required()} />
      <TextInput label="Part of Speech" source="wordClass" validate={required()} />
      <ArrayInput label="All Definitions" individualLabel="Definition" source="definitions" />
      <NumberInput disabled label="Approvals" format={approvalAndDenialsFormatter} source="approvals" />
      <NumberInput disabled label="Denials" format={approvalAndDenialsFormatter} source="denials" />
      <RichTextInput label="Editors' Notes" source="details" />
    </SimpleForm>
  </Edit>
);
