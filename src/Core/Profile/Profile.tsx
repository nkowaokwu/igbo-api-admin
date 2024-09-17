import React, { ReactElement } from 'react';
import { getAuth } from 'firebase/auth';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import AccountSettings from 'src/Core/Dashboard/components/AccountSettings';
import ContactSupport from 'src/Core/Dashboard/components/ContactSupport';
import Settings from 'src/Core/Layout/components/Settings';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';

const auth = getAuth();
const Profile = (): ReactElement => {
  const userProjectPermission = React.useContext(UserProjectPermissionContext);
  const user = auth.currentUser;

  const tabLabels = ['General', 'Account', 'Support'];
  const tabPanels = [
    user ? <UserStat user={user} /> : null,
    user ? <AccountSettings user={user} userProjectPermission={userProjectPermission} /> : null,
    <ContactSupport />,
  ];

  return <Settings title="Profile" tabLabels={tabLabels} tabPanels={tabPanels} />;
};

export default Profile;
