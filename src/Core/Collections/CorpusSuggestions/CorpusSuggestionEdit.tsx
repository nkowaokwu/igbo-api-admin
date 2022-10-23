import React, { ReactElement } from 'react';
import { SimpleForm, EditProps } from 'react-admin';
import { EditToolbar, CorpusSuggestionEdit as Edit } from 'src/shared/components';
import { CorpusSuggestionTitle } from '.';

const CorpusSuggestionEdit = (props: EditProps): ReactElement => (
  <Edit title={<CorpusSuggestionTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
    </SimpleForm>
  </Edit>
);

export default CorpusSuggestionEdit;
