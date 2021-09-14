import React, { ReactElement } from 'react';
import { TopToolbar, ShowActionsProps } from 'react-admin';
import { CreateButton } from '../shared/primitives';

const ExampleShowActions = ({ data }: ShowActionsProps): ReactElement => (
  <TopToolbar>
    <CreateButton basePath="/exampleSuggestions" record={data} />
  </TopToolbar>
);

export { ExampleShowActions };
