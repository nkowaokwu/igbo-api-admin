import React, { ReactElement } from 'react';
import {
  SimpleForm,
  TextInput,
  NumberInput,
  EditProps,
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import { approvalAndDenialsFormatter } from 'src/shared/utils';
import { EditToolbar, ArrayInput, ExampleSuggestionEdit as Edit } from 'src/shared/components';
import { ExampleSuggestionTitle } from '.';

const ExampleSuggestionEdit = (props: EditProps): ReactElement => (
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

export default ExampleSuggestionEdit;
