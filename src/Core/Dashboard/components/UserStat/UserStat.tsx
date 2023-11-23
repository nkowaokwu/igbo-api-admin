import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Heading, Skeleton, useToast } from '@chakra-ui/react';
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
  const [recordingStats, setRecordingStats] = useState({ recorded: {}, verified: {}, mergedRecorded: {} });
  const [audioStats, setAudioStats] = useState({ audioApprovalsCount: 0, audioDenialsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { permissions } = usePermissions();
  const toast = useToast();
  const isCrowdsourcer = hasCrowdsourcerPermission(permissions, true);

  useEffect(() => {
    (async () => {
      try {
        const { uid } = user;
        network(`/stats/users/${uid}`).then(({ json }) => setUserStats(json));
        network(`/stats/users/${uid}/audio`).then(({ json }) => {
          setAudioStats(json);
        });
        const { timestampedExampleSuggestions: mergedExampleSuggestion } =
          await getTotalMergedRecordedExampleSuggestions(uid);
        const { timestampedRecordedExampleSuggestions } = await getTotalRecordedExampleSuggestions(uid);
        const { timestampedReviewedExampleSuggestions } = await getTotalReviewedExampleSuggestions(uid);
        setRecordingStats({
          recorded: timestampedRecordedExampleSuggestions,
          verified: timestampedReviewedExampleSuggestions,
          mergedRecorded: mergedExampleSuggestion, // Count of audio recordings by current user that have been merged
        });
        setIsLoading(false);
      } catch (err) {
        toast({
          title: 'An error occurred',
          description: 'Unable to load profile stats.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
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
              <Skeleton isLoaded={!isLoading}>
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
