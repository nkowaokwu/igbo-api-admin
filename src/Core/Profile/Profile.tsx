import React, { useState, ReactElement, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getUserProfile } from 'src/shared/UserAPI';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import AccountSettings from 'src/Core/Dashboard/components/AccountSettings';
import ContactSupport from 'src/Core/Dashboard/components/ContactSupport';
import Settings from 'src/Core/Layout/components/Settings';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';

const auth = getAuth();
const Profile = (): ReactElement => {
  const [user, setUser] = useState<UserProfile>();
  const userProjectPermission = React.useContext(UserProjectPermissionContext);

  const {
    currentUser: { uid },
  } = auth;

  useEffect(() => {
    getUserProfile(uid).then(setUser);
  }, []);

  const tabLabels = ['General', 'Account', 'Support'];
  const tabPanels = [
    user ? <UserStat user={user} /> : null,
    user ? <AccountSettings user={user} userProjectPermission={userProjectPermission} /> : null,
    <ContactSupport />,
  ];

  return <Settings title="Profile" tabLabels={tabLabels} tabPanels={tabPanels} />;
};

export default Profile;
