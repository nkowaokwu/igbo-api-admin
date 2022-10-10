import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { WordShow as Show } from 'src/shared/components';
import { GenericWordTitle } from '.';

const GenericWordShow = (props: ShowProps): ReactElement => (
  <Show title={<GenericWordTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default GenericWordShow;
