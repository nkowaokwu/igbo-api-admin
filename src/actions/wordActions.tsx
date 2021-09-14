import React, { ReactElement } from 'react';
import { TopToolbar, ShowActionsProps } from 'react-admin';
import { CreateButton } from '../shared/primitives';

const WordShowActions = ({ data }: ShowActionsProps): ReactElement => (
  <TopToolbar>
    <CreateButton basePath="/wordSuggestions" record={data} />
  </TopToolbar>
);

export { WordShowActions };
