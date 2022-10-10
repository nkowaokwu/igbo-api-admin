import React, { ReactElement } from 'react';
import { SimpleShowLayout, ShowProps } from 'react-admin';
import { UserShow as Show } from 'src/shared/components';

const UserTitle = ({ record }: Record<any, any>): ReactElement => (
  <span>{`User ${record ? `"${record.firebaseId}"` : ''}`}</span>
);

const UserShow = (props: ShowProps): ReactElement => (
  <Show
    title={<UserTitle />}
    {...props}
  >
    <SimpleShowLayout>
    </SimpleShowLayout>
  </Show>
);

export default UserShow;
