import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { WordShow as Show } from 'src/shared/components';
import { WordShowActions } from 'src/actions/wordActions';

const WordTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>{`Word ${record ? `"${record.word}"` : ''}`}</span>
);

const WordShow = (props: ShowProps): ReactElement => (
  <Show
    actions={<WordShowActions />}
    title={<WordTitle />}
    {...props}
  >
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default WordShow;
