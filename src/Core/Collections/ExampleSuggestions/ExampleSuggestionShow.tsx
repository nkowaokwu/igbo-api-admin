import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { ExampleShow as Show } from 'src/shared/components';
import { ExampleSuggestionTitle } from '.';

const ExampleSuggestionShow = (props: ShowProps): ReactElement => (
  <Show title={<ExampleSuggestionTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default ExampleSuggestionShow;
