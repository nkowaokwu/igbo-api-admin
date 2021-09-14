import React, { ReactElement } from 'react';
import {
  DeleteWithConfirmButton,
  EditProps,
  Toolbar,
} from 'react-admin';
import UpdateButton from '../buttons/UpdateButton';

const EditToolbar = (props: EditProps): ReactElement => (
  <Toolbar {...props}>
    <UpdateButton />
    <DeleteWithConfirmButton />
  </Toolbar>
);

export default EditToolbar;
