import React, { ReactElement } from 'react';
import { SimpleForm, EditProps } from 'react-admin';
import { EditToolbar, NsibidiCharacterEdit as Edit } from 'src/shared/components';
import { NsibidiCharacterTitle } from '.';

const NsibidiCharacterEdit = (props: EditProps): ReactElement => (
  <Edit title={<NsibidiCharacterTitle />} undoable={false} {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
    </SimpleForm>
  </Edit>
);

export default NsibidiCharacterEdit;
