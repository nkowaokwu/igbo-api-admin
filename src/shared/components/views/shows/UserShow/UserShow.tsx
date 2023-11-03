import React, { ReactElement, useState, useEffect } from 'react';
import { camelCase } from 'lodash';
import { ShowProps, usePermissions, useShowController } from 'react-admin';
import { Box, Skeleton } from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import { hasNoEditorPermissions } from 'src/shared/utils/permissions';

const DEFAULT_USER_RECORD = { displayName: '', photoURL: '', email: '', uid: '' };

const NO_PERMISSION_STATUS = 403;
const UserShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const showProps = useShowController(props);
  const permissions = usePermissions();
  const { record = DEFAULT_USER_RECORD } = showProps;

  const { displayName, photoURL, email, uid } = record;
  const user = { displayName, photoURL, email, uid };

  const handleNoPermissionStatus = ({ status }) => {
    if (status === NO_PERMISSION_STATUS) {
      window.location.hash = '#/';
    }
  };

  useEffect(() => {
    if (showProps?.record?.uid) {
      setIsLoading(false);
    }
  }, [showProps]);

  useEffect(() => {
    if (!hasNoEditorPermissions(permissions?.permissions, true)) {
      network('/stats/full')
        .then(({ body }) => {
          const parsedBody = JSON.parse(body);
          const updatedStats = Object.entries(parsedBody).reduce(
            (finalStats, [key, value]: [string, { value: number }]) => ({
              ...finalStats,
              [camelCase(key)]: value.value,
            }),
            {},
          );
          setStats(updatedStats);
        })
        .catch(handleNoPermissionStatus);
    }
  }, [permissions]);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box className="bg-white shadow-sm px-10">
        {record.uid && !isLoading ? <UserStat uid={record.uid} user={user} {...stats} /> : null}
      </Box>
    </Skeleton>
  );
};

export default UserShow;
