import React, { ReactElement } from 'react';
import { SimpleForm, CreateProps } from 'react-admin';
import { NsibidiCharacterCreate as Create } from 'src/shared/components';

const NsibidiCharacterCreate = (props: CreateProps): ReactElement => (
  <Create title="Create a Nsịbịdị Character" undoable={false} {...props}>
    <SimpleForm toolbar={null}>
    </SimpleForm>
  </Create>
);

export default NsibidiCharacterCreate;
