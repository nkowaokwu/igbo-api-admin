import React, { ReactElement } from 'react';
import { SimpleForm, CreateProps } from 'react-admin';
import {
  WordSuggestionCreate as Create,
} from 'src/shared/components';

const WordSuggestionCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Word Suggestion" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);

export default WordSuggestionCreate;
