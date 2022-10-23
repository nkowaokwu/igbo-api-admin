import React, { ReactElement } from 'react';
import { TopToolbar, ShowActionsProps } from 'react-admin';
import Collection from 'src/shared/constants/Collections';
import { CreateButton } from '../shared/primitives';

const ExampleShowActions = ({ data }: ShowActionsProps): ReactElement => (
  <TopToolbar>
    <CreateButton basePath={`/${Collection.EXAMPLE_SUGGESTIONS}`} record={data} />
  </TopToolbar>
);

export { ExampleShowActions };
