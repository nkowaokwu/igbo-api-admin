import React, { ReactElement, useState, useEffect } from 'react';
import { noop } from 'lodash';
import { ShowProps, usePermissions, useShowController } from 'react-admin';
import { Box, Skeleton } from '@chakra-ui/react';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import { hasNoEditorPermissions } from 'src/shared/utils/permissions';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import { getUserStats } from 'src/shared/UserAPI';

const DEFAULT_USER_RECORD = {
  displayName: '',
  photoURL: '',
  email: '',
  uid: '',
  age: null,
  createdAt: null,
  updatedAt: null,
  dialects: [],
  firebaseId: '',
  gender: GenderEnum.UNSPECIFIED,
  providerId: null,
  phoneNumber: '',
  referralCode: '',
  toJSON: noop,
  id: '',
  role: UserRoles.USER,
  editingGroup: '',
};

const NO_PERMISSION_STATUS = 403;
const UserShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const showProps = useShowController(props);
  const permissions = usePermissions();
  const { record } = showProps;
  const user = (record || DEFAULT_USER_RECORD) as UserProfile;

  const handleNoPermissionStatus = ({ status }) => {
    if (status === NO_PERMISSION_STATUS) {
      window.location.hash = '#/';
    }
  };

  useEffect(() => {
    if (user?.uid) {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      if (!hasNoEditorPermissions(permissions?.permissions, true)) {
        try {
          const updatedStats = await getUserStats();
          setStats(updatedStats);
        } catch (err) {
          handleNoPermissionStatus(err);
        }
      }
    })();
  }, [permissions]);

  return (
    <Skeleton isLoaded={!isLoading} minHeight="100vh">
      <Box className="bg-white shadow-sm px-4">
        {user.uid && !isLoading ? <UserStat user={user} {...stats} /> : null}
      </Box>
    </Skeleton>
  );
};

export default UserShow;
