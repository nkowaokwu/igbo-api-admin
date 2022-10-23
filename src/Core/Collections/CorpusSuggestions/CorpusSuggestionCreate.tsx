import React, { ReactElement } from 'react';
import { SimpleForm, CreateProps } from 'react-admin';
import { CorpusSuggestionCreate as Create } from 'src/shared/components';

const CorpusSuggestionCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Corpus Suggestion" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);

export default CorpusSuggestionCreate;
