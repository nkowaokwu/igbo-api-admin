import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { ExampleShow as Show } from 'src/shared/components';

const DataCollectionShow = (props: ShowProps): ReactElement => (
  <Show {...props} title="Data Collection Show">
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default DataCollectionShow;
