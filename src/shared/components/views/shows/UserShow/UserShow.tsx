import React, { ReactElement, useState, useEffect } from 'react';
import { ShowProps, usePermissions, useShowController } from 'react-admin';
import {
  Avatar,
  Box,
  Heading,
  Skeleton,
} from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import UserStat from 'src/Core/Dashboard/components/UserStat';
import PersonalStats from 'src/Core/Collections/DataCollection/PersonalStats';
import { hasNoEditorPermissions } from 'src/shared/utils/permissions';

const NO_PERMISSION_STATUS = 403;
const UserShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalCompletedWords, setTotalCompletedWords] = useState(null);
  const [totalCompletedExamples, setTotalCompletedExamples] = useState(null);
  const [totalDialectalVariations, setTotalDialectalVariations] = useState(null);
  const showProps = useShowController(props);
  const permissions = usePermissions();
  let { record } = showProps;

  record = record || { id: null };

  const {
    displayName,
    photoURL,
    email,
  } = record;

  const handleNoPermissionStatus = ({ status }) => {
    if (status === NO_PERMISSION_STATUS) {
      window.location.hash = '#/';
    }
  };

  useEffect(() => {
    if (record?.uid) {
      setIsLoading(false);
    }
  }, [record]);

  useEffect(() => {
    // @ts-expect-error permissions
    if (!hasNoEditorPermissions(permissions, true)) {
      network('/stats/full')
        .then(({ body }) => {
          const {
            complete_words,
            dialectal_variations,
            complete_examples,
          } = JSON.parse(body);
          setTotalCompletedWords(complete_words?.value || 0);
          setTotalCompletedExamples(complete_examples?.value || 0);
          setTotalDialectalVariations(dialectal_variations?.value || 0);
        })
        .catch(handleNoPermissionStatus);
    }
  }, [permissions]);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box className="bg-white shadow-sm p-10 mt-10">
        <Box className="flex flex-col lg:flex-row items-center text-center lg:text-left space-y-4 lg:space-x-4 mb-4">
          <Avatar name={displayName} src={photoURL} size="xl" />
          <Box>
            <Heading className={!displayName ? 'text-gray-500 italic' : ''}>{displayName || 'No display name'}</Heading>
            <a className="underline text-green-500" href={`mailto:${email}`}>{email}</a>
          </Box>
        </Box>
        {record.uid && !isLoading ? (
          <>
            <UserStat
              uid={record.uid}
              totalCompletedWords={totalCompletedWords}
              totalCompletedExamples={totalCompletedExamples}
              totalDialectalVariations={totalDialectalVariations}
            />
            <PersonalStats uid={record.uid} />
          </>
        ) : null}
      </Box>
    </Skeleton>
  );
};

export default UserShow;
