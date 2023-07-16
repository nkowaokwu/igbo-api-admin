import React, { ReactElement, useEffect, useState } from 'react';
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { Avatar, Box, Button, Heading, Select, Text, useToast, chakra } from '@chakra-ui/react';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { getLeaderboardStats } from 'src/shared/DataCollectionAPI';
import { Spinner } from 'src/shared/primitives';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardUser from 'src/Core/Collections/Leaderboard/LeaderboardUser';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';

type CachedRankings = {
  [timeRange in LeaderboardTimeRange]: {
    [leaderboard in LeaderboardType]: {
      userRanking: UserRanking;
      rankings: UserRanking[];
    };
  };
};

const LeaderboardTimeRangesMap = {
  [LeaderboardTimeRange.ALL_TIME]: 'All time',
  [LeaderboardTimeRange.WEEK]: 'Weekly',
  [LeaderboardTimeRange.MONTH]: 'Monthly',
  [LeaderboardTimeRange.IGBO_VOICE_ATHON]: 'Igbo Voice-athon',
};

const BottomCardRanking = ({
  displayName,
  photoURL,
  count,
  position,
}: {
  displayName: string;
  photoURL: string;
  email: string;
  count: number;
  position: number;
}) => (
  <Box
    position="fixed"
    bottom={0}
    left={0}
    className="w-full h-18 p-2 bg-white"
    boxShadow="0px -2px 5px var(--chakra-colors-gray-300)"
  >
    <Box className="flex flex-row space-x-3 items-center">
      {typeof position === 'number' ? <Text fontFamily="Silka" color="gray.500">{`${position}.`}</Text> : null}
      <Box>
        <Box className="flex flex-row space-x-2 items-center">
          <Avatar src={photoURL} name={displayName} size="sm" />
          <Box>
            {typeof position === 'number' ? (
              <>
                <Text fontWeight="bold" fontSize="sm" fontFamily="Silka">
                  {displayName}
                </Text>
                <Text color="gray.500" fontSize="sm" fontFamily="Silka">{`${count} points`}</Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold" fontSize="sm" fontFamily="Silka">
                  No available rank
                </Text>
                <Text color="gray.500" fontSize="sm" fontFamily="Silka">
                  Please make a contribution to see your rank
                </Text>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

const Leaderboard = (): ReactElement => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardType>(LeaderboardType.RECORD_EXAMPLE_AUDIO);
  const [leaderboardTimeRange, setLeaderboardTimeRange] = useState<LeaderboardTimeRange>(LeaderboardTimeRange.ALL_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [userRanking, setUserRanking] = useState<UserRanking>({} as UserRanking);
  const [rankings, setRankings] = useState([]);
  const [cachedFetchedData, setCachedFetchedData] = useState<CachedRankings>({} as CachedRankings);
  const toast = useToast();
  const igboVoiceathonStartDate = moment('2023-07-24');
  const igboVoiceathonEndDate = moment('2023-10-24');
  const showIgboVoiceathonMessage =
    leaderboardTimeRange === LeaderboardTimeRange.IGBO_VOICE_ATHON &&
    !moment().isBetween(igboVoiceathonStartDate, igboVoiceathonEndDate);

  const handleUpdateLeaderboard = (event) => {
    const updatedLeaderboard = event.target.value as LeaderboardType;
    if (leaderboard !== updatedLeaderboard) {
      setLeaderboard(updatedLeaderboard);
    }
  };
  const handleRequestingLeaderboard = async () => {
    setIsLoading(true);
    try {
      if (get(cachedFetchedData, `${leaderboardTimeRange}.${leaderboard}`)) {
        setUserRanking(cachedFetchedData[leaderboardTimeRange][leaderboard].userRanking);
        setRankings(cachedFetchedData[leaderboardTimeRange][leaderboard].rankings);
        return;
      }

      const result = await getLeaderboardStats({ leaderboard, timeRange: leaderboardTimeRange });
      if (!cachedFetchedData[leaderboard]) {
        const filteredRankings = (result.rankings || []).filter(({ position }) => typeof position === 'number');
        setUserRanking(result.userRanking);
        setRankings(filteredRankings);
        const updatedCachedData = {
          ...cloneDeep(cachedFetchedData),
          [leaderboardTimeRange]: {
            ...cloneDeep(get(cachedFetchedData, leaderboardTimeRange)),
            [leaderboard]: { userRanking: result.userRanking, rankings: filteredRankings },
          },
        };
        setCachedFetchedData(updatedCachedData);
      }
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to load leaderboard.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTimeRange = (timeRange: LeaderboardTimeRange) => {
    setLeaderboardTimeRange(timeRange);
  };

  useEffect(() => {
    handleRequestingLeaderboard();
  }, [leaderboard, leaderboardTimeRange]);

  return !isLoading ? (
    <Box className="p-6">
      <Heading as="h1" fontSize="xl" mb={2}>
        Leaderboards
      </Heading>
      <Select defaultValue={leaderboard} onChange={handleUpdateLeaderboard} fontFamily="Silka">
        <option value={LeaderboardType.RECORD_EXAMPLE_AUDIO}>Recorded example audio</option>
        <option value={LeaderboardType.VERIFY_EXAMPLE_AUDIO}>Verified example audio</option>
      </Select>
      <Box className="space-x-3 my-4">
        {Object.entries(LeaderboardTimeRange).map(([key, value]) => (
          <Button
            key={key}
            colorScheme={value === leaderboardTimeRange ? 'green' : 'gray'}
            onClick={() => handleSelectTimeRange(value)}
          >
            {LeaderboardTimeRangesMap[value]}
          </Button>
        ))}
      </Box>
      {showIgboVoiceathonMessage ? (
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          <chakra.span fontWeight="bold" mr="1">
            Note:
          </chakra.span>
          Rankings are not accurate for the Igbo Voice-athon because the competition is not active
        </Text>
      ) : null}
      <Box>
        {rankings.map(({ uid, ...rest }) => (
          <LeaderboardUser key={uid} {...rest} />
        ))}
      </Box>
      <BottomCardRanking {...userRanking} />
    </Box>
  ) : (
    <Spinner />
  );
};

export default Leaderboard;
