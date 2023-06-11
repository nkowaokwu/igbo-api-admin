import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { NsibidiCharacterShow as Show } from 'src/shared/components';
import { NsibidiCharacterTitle } from '.';

const NsibidiCharacterShow = (props: ShowProps): ReactElement => (
  <Show title={<NsibidiCharacterTitle />} {...props}>
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default NsibidiCharacterShow;
