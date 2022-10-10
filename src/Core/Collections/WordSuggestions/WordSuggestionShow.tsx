import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { WordShow as Show } from 'src/shared/components';
import { WordSuggestionTitle } from '.';

const WordSuggestionShow = (props: ShowProps): ReactElement => (
  <Show title={<WordSuggestionTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default WordSuggestionShow;
