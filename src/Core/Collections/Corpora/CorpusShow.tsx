import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { CorpusShow as Show } from 'src/shared/components';
import { CorpusShowActions } from 'src/actions/corpusActions';

const CorpusTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>{`Corpus ${record ? `"${record.title}"` : ''}`}</span>
);

const CorpusShow = (props: ShowProps): ReactElement => (
  <Show
    actions={<CorpusShowActions />}
    title={<CorpusTitle />}
    {...props}
  >
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default CorpusShow;
