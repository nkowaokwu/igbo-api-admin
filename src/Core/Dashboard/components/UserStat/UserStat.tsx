import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Heading, Skeleton } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { hasCrowdsourcerPermission } from 'src/shared/utils/permissions';
import {
  getTotalRecordedExampleSuggestions,
  getTotalMergedRecordedExampleSuggestions,
  getTotalReviewedExampleSuggestions,
} from 'src/shared/DataCollectionAPI';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import UserCard from 'src/shared/components/UserCard';
import network from '../../network';
import PersonalStats from '../PersonalStats/PersonalStats';
import IgboSoundboxStats from '../IgboSoundboxStats';
import { RefferalCode } from '../RefferalCode';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserStat = ({
  isEditing = false,
  user,
}: {
  isEditing?: boolean;
  user: UserProfile;
  dialectalVariations: number;
  completeExamples: number;
}): ReactElement => {
  const [userStats, setUserStats] = useState(null);
  const [recordingStats, setRecordingStats] = useState({ recorded: -1, verified: -1, mergedRecorded: {} });
  const [audioStats, setAudioStats] = useState({ audioApprovalsCount: 0, audioDenialsCount: 0 });
  const { permissions } = usePermissions();
  const isCrowdsourcer = hasCrowdsourcerPermission(permissions, true);

  useEffect(() => {
    (async () => {
      const { uid } = user;
      network(`/stats/users/${uid}`).then(({ json }) => setUserStats(json));
      network(`/stats/users/${uid}/audio`).then(({ json }) => {
        setAudioStats(json);
      });
      const { timestampedExampleSuggestions: recordedExampleSuggestions } =
        await getTotalMergedRecordedExampleSuggestions(uid);
      const { count: recorded } = await getTotalRecordedExampleSuggestions(uid);
      const { count: verifiedCount } = await getTotalReviewedExampleSuggestions(uid);
      setRecordingStats({
        recorded,
        verified: verifiedCount,
        mergedRecorded: recordedExampleSuggestions, // Count of audio recordings by current user that have been merged
      });
    })();
  }, []);

  return (
    <Box mt={4}>
      <Skeleton isLoaded={Boolean(user?.firebaseId || user?.uid)}>
        <UserCard {...user} isEditing={isEditing} />
      </Skeleton>
      <Box className="flex flex-col lg:flex-row space-x-0 lg:space-x-4 space-y-4 lg:space-y-0">
        <Box className="w-full">
          <Heading as="h2" mb={4}>
            Contributions
          </Heading>
          <Box className="flex flex-col lg:flex-row justify-between items-start space-y-3 lg:space-y-0">
            <Box className="space-y-3 w-full">
              <IgboSoundboxStats recordingStats={recordingStats} audioStats={audioStats} />
              {!isCrowdsourcer ? <PersonalStats userStats={userStats} /> : null}
              <RefferalCode />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserStat;
