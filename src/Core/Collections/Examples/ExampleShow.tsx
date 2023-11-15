import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { ExampleShow as Show } from 'src/shared/components';
import { ExampleShowActions } from 'src/actions/exampleActions';

const ExampleTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>
    {'Example '}
    {record ? `"${record.igbo || record.english}"` : ''}
  </span>
);

const ExampleShow = (props: ShowProps): ReactElement => (
  // @ts-expect-error Show
  <Show actions={<ExampleShowActions />} title={<ExampleTitle />} {...props}>
    <SimpleShowLayout></SimpleShowLayout>
  </Show>
);

export default ExampleShow;
