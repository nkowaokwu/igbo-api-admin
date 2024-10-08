import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Heading, Skeleton, useToast } from '@chakra-ui/react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getUserExampleSuggestionRecordings, getUserExampleSuggestionTranslations } from 'src/shared/UserAPI';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import UserCard from 'src/shared/components/UserCard';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import ProjectType from 'src/backend/shared/constants/ProjectType';
import { FetchedStats } from 'src/Core/Dashboard/components/UserStat/UserStatInterfaces';
import IgboSoundboxStats from '../IgboSoundboxStats';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserStat = ({ user }: { user: UserProfile }): ReactElement => {
  const [stats, setStats] = useState<FetchedStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const project = React.useContext(ProjectContext);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { uid } = user;
        const fetchedStats: FetchedStats = {};

        await Promise.all(
          project.types.map(async (type) => {
            switch (type) {
              case ProjectType.TEXT_AUDIO_ANNOTATION:
                fetchedStats.recordings = {
                  stats: await getUserExampleSuggestionRecordings(uid),
                };

                break;
              case ProjectType.TRANSLATION:
                fetchedStats.translations = {
                  stats: await getUserExampleSuggestionTranslations(uid),
                };
                break;
              default:
                break;
            }
          }),
        );

        setStats(fetchedStats);
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
        <UserCard user={user} />
      </Skeleton>
      <Box className="flex flex-col lg:flex-row space-x-0 lg:space-x-4 space-y-4 lg:space-y-0">
        <Box className="w-full">
          <Heading as="h2" mb={4}>
            Contributions
          </Heading>
          <Box className="flex flex-col lg:flex-row justify-between items-start space-y-3 lg:space-y-0">
            <Box className="space-y-3 w-full">
              <Skeleton isLoaded={!isLoading}>
                <IgboSoundboxStats stats={stats} />
              </Skeleton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserStat;
