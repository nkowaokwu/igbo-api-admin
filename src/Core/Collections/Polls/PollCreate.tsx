import React, { ReactElement } from 'react';
import { SimpleForm, CreateProps } from 'react-admin';
import { PollsCreate as Create } from 'src/shared/components';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';

const PollCreate = (props: CreateProps): ReactElement => {
  const { permissions } = props;
  return hasAdminOrMergerPermissions(permissions, (
    <Create title="Create a Constructed Term Poll" undoable={false} {...props}>
      <SimpleForm toolbar={null}>
      </SimpleForm>
    </Create>
  ));
};

export default PollCreate;
