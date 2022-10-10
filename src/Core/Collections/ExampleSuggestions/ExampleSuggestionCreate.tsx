import React, { ReactElement } from 'react';
import { SimpleForm, CreateProps } from 'react-admin';
import { ExampleSuggestionCreate as Create } from 'src/shared/components';

const ExampleSuggestionCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Example Suggestion" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);

export default ExampleSuggestionCreate;
