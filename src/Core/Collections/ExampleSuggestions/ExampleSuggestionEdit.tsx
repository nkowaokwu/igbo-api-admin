import React, { ReactElement } from 'react';
import { SimpleForm, EditProps } from 'react-admin';
import { EditToolbar, ExampleSuggestionEdit as Edit } from 'src/shared/components';
import { ExampleSuggestionTitle } from '.';

const ExampleSuggestionEdit = (props: EditProps): ReactElement => (
  <Edit title={<ExampleSuggestionTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
    </SimpleForm>
  </Edit>
);

export default ExampleSuggestionEdit;
