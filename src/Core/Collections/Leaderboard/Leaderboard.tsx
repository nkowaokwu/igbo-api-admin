import React, { ReactElement, useEffect, useState } from 'react';
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { Box, Button, Heading, Select, Text, Tooltip, useToast, chakra } from '@chakra-ui/react';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { getLeaderboardStats } from 'src/shared/DataCollectionAPI';
import { Spinner } from 'src/shared/primitives';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardUser from 'src/Core/Collections/Leaderboard/LeaderboardUser';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import BottomCardRanking from 'src/Core/Collections/Leaderboard/BottomCardRanking';

type CachedRankings = {
  [timeRange in LeaderboardTimeRange]: {
    [leaderboard in LeaderboardType]: {
      userRanking: UserRanking;
      rankings: UserRanking[];
    };
  };
};

const LeaderboardTimeRangesMap = {
  [LeaderboardTimeRange.ALL_TIME]: {
    label: 'All time',
    tooltip: 'Points collected for all time',
  },
  [LeaderboardTimeRange.WEEK]: {
    label: 'Weekly',
    tooltip: `Points collected for the current week - ${moment().startOf('week').format('MMMM D')} to ${moment()
      .endOf('week')
      .format('MMMM D')}`,
  },
  [LeaderboardTimeRange.MONTH]: {
    label: 'Monthly',
    tooltip: `Points collected for the current month - ${moment().startOf('month').format('MMMM D')} to ${moment()
      .endOf('month')
      .format('MMMM D')}`,
  },
  [LeaderboardTimeRange.IGBO_VOICE_ATHON]: {
    label: 'Igbo Voice-athon',
    tooltip: 'Points collected for the Igbo Voice-athon - July 24 to October 24',
  },
};

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
        <option value={LeaderboardType.TRANSLATE_IGBO_SENTENCE}>Translate Igbo sentences</option>
      </Select>
      <Heading as="h2" fontSize="lg" my={2}>
        Time frames
      </Heading>
      <Box className="grid grid-flow-row grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        {Object.entries(LeaderboardTimeRange)
          // Only shows Igbo Voice-athon for recording audio
          .filter(([, timeRange]) =>
            leaderboard === LeaderboardType.RECORD_EXAMPLE_AUDIO
              ? true
              : timeRange !== LeaderboardTimeRange.IGBO_VOICE_ATHON,
          )
          .map(([key, value]) => (
            <Tooltip label={LeaderboardTimeRangesMap[value].tooltip}>
              <Button
                key={key}
                colorScheme={value === leaderboardTimeRange ? 'green' : 'gray'}
                onClick={() => handleSelectTimeRange(value)}
              >
                {LeaderboardTimeRangesMap[value].label}
              </Button>
            </Tooltip>
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
