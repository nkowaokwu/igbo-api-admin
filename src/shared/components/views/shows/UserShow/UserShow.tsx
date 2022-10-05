import React, { ReactElement, useState, useEffect } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import {
  Avatar,
  Box,
  Heading,
  Skeleton,
} from '@chakra-ui/react';
import UserStat from 'src/Core/Dashboard/UserStat/UserStat';

const UserShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const showProps = useShowController(props);
  const { permissions } = props;
  let { record } = showProps;

  record = record || {};

  const {
    displayName,
    photoURL,
    email,
  } = record;

  useEffect(() => {
    if (record?.uid) {
      setIsLoading(false);
    }
  }, [record]);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box className="bg-white shadow-sm p-10 mt-10">
        <Box className="flex flex-col lg:flex-row items-center text-center lg:text-left space-y-4 lg:space-x-4">
          <Avatar name={displayName} src={photoURL} size="xl" />
          <Box>
            <Heading className={!displayName ? 'text-gray-500 italic' : ''}>{displayName || 'No display name'}</Heading>
            <a className="underline text-green-500" href={`mailto:${email}`}>{email}</a>
          </Box>
        </Box>
        <Heading size="lg" className="mt-3">Total User Stats</Heading>
        {record.uid ? <UserStat uid={record.uid} permissions={permissions} /> : null}
      </Box>
    </Skeleton>
  );
};

export default UserShow;
