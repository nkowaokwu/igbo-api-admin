import React, { ReactElement } from 'react';
import { TopToolbar, ShowActionsProps } from 'react-admin';
import { CreateButton } from '../shared/primitives';

const CorpusShowActions = ({ data }: ShowActionsProps): ReactElement => (
  <TopToolbar>
    <CreateButton basePath="/corpusSuggestions" record={data} />
  </TopToolbar>
);

export { CorpusShowActions };
