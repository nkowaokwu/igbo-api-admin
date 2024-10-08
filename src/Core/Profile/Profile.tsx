import React, { ReactElement, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import AccountSettings from 'src/Core/Dashboard/components/AccountSettings';
import ContactSupport from 'src/Core/Dashboard/components/ContactSupport';
import Settings from 'src/Core/Layout/components/Settings';
import { getUserProfile } from 'src/shared/UserAPI';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';

const auth = getAuth();
const Profile = (): ReactElement => {
  const [user, setUser] = useState<UserProfile>(null);
  const userProjectPermission = React.useContext(UserProjectPermissionContext);

  useEffect(() => {
    (async () => {
      const fetchedUser = await getUserProfile(auth.currentUser?.uid);
      setUser(fetchedUser);
    })();
  }, []);

  const tabLabels = ['General', 'Account', 'Support'];
  const tabPanels = [
    user ? <UserStat user={user} /> : null,
    user ? <AccountSettings user={user} triggerRefetch={userProjectPermission.triggerRefetch} /> : null,
    <ContactSupport />,
  ];

  return <Settings title="Profile" tabLabels={tabLabels} tabPanels={tabPanels} />;
};

export default Profile;
