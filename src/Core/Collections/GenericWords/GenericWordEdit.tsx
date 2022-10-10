import React, { ReactElement } from 'react';
import {
  SimpleForm,
  NumberInput,
  TextInput,
  required,
  EditProps,
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import { approvalAndDenialsFormatter } from 'src/shared/utils';
import { ArrayInput, EditToolbar, WordSuggestionEdit as Edit } from 'src/shared/components';
import { GenericWordTitle } from '.';

const GenericWordEdit = (props: EditProps): ReactElement => (
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

export default GenericWordEdit;
