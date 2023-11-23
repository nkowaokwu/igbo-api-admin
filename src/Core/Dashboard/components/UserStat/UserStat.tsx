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
import ReferralCode from 'src/Core/Dashboard/components/ReferralCode';
import network from '../../network';
import PersonalStats from '../PersonalStats/PersonalStats';
import IgboSoundboxStats from '../IgboSoundboxStats';

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
      const { timestampedExampleSuggestions: mergedExampleSuggestion } = await getTotalMergedRecordedExampleSuggestions(
        uid,
      );
      const { timestampedRecordedExampleSuggestions } = await getTotalRecordedExampleSuggestions(uid);
      const { timestampedReviewedExampleSuggestions } = await getTotalReviewedExampleSuggestions(uid);
      const recordedExampleSuggestions = Object.values(timestampedRecordedExampleSuggestions).reduce(
        (total, count) => total + count,
        0,
      );
      const reviewedExampleSuggestions = Object.values(timestampedReviewedExampleSuggestions).reduce(
        (total, count) => total + count,
        0,
      );
      setRecordingStats({
        recorded: recordedExampleSuggestions,
        verified: reviewedExampleSuggestions,
        mergedRecorded: mergedExampleSuggestion, // Count of audio recordings by current user that have been merged
      });
    })();
  }, []);

  return (
    <Box m={4}>
      <Skeleton isLoaded={Boolean(user?.firebaseId || user?.uid)}>
        <UserCard {...user} isEditing={isEditing} />
      </Skeleton>
      <Box className="flex flex-col lg:flex-row space-x-0 lg:space-x-4 space-y-4 lg:space-y-0">
        <Box className="w-full">
          <Skeleton isLoaded={Boolean(user?.referralCode)}>
            <ReferralCode referralCode={user.referralCode} />
          </Skeleton>
          <Heading as="h2" mb={4}>
            Contributions
          </Heading>
          <Box className="flex flex-col lg:flex-row justify-between items-start space-y-3 lg:space-y-0">
            <Box className="space-y-3 w-full">
              <Skeleton isLoaded={recordingStats.recorded !== -1}>
                <IgboSoundboxStats recordingStats={recordingStats} audioStats={audioStats} />
              </Skeleton>
              {!isCrowdsourcer ? <PersonalStats userStats={userStats} /> : null}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserStat;
