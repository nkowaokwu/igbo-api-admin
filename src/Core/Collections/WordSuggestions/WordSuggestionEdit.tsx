import React, { ReactElement } from 'react';
import { SimpleForm, EditProps } from 'react-admin';
import { WordSuggestionEdit as Edit } from 'src/shared/components';
import { WordSuggestionTitle } from '.';

const WordSuggestionEdit = (props: EditProps): ReactElement => (
  <Edit title={<WordSuggestionTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Edit>
);

export default WordSuggestionEdit;
