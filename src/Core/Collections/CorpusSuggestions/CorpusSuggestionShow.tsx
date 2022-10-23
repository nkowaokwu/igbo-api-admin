import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { CorpusShow as Show } from 'src/shared/components';
import { CorpusSuggestionTitle } from '.';

const CorpusSuggestionShow = (props: ShowProps): ReactElement => (
  <Show title={<CorpusSuggestionTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default CorpusSuggestionShow;
