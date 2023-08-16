import React, { ReactElement, useEffect, useState } from 'react';
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { act } from 'react-dom/test-utils';
import { Box, IconButton, Grid, Heading, Text, useToast, chakra, Tooltip, Button } from '@chakra-ui/react';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { getLeaderboardStats } from 'src/shared/DataCollectionAPI';
import { Spinner } from 'src/shared/primitives';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardUser from 'src/Core/Collections/Leaderboard/LeaderboardUser';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import BottomCardRanking from 'src/Core/Collections/Leaderboard/BottomCardRanking';
import { LeaderboardRenderer } from './components/LeaderboardRenderer';
import { leaderboardItems } from './config/leaderboardItems';
import * as Icons from '../iconography';

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
  const [selectedLeaderboardType, setSelectedLeaderboardType] = useState<LeaderboardType | null>(null);
  const [leaderboardTimeRange, setLeaderboardTimeRange] = useState<LeaderboardTimeRange>(LeaderboardTimeRange.ALL_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [userRanking, setUserRanking] = useState<UserRanking>({} as UserRanking);
  const [rankings, setRankings] = useState([]);
  const [cachedFetchedData, setCachedFetchedData] = useState<CachedRankings>({} as CachedRankings);
  const toast = useToast();
  const selectedLeaderboard = leaderboardItems.find(({ id }) => id === selectedLeaderboardType);
  const igboVoiceathonStartDate = moment('2023-07-24');
  const igboVoiceathonEndDate = moment('2023-10-24');
  const showIgboVoiceathonMessage =
    leaderboardTimeRange === LeaderboardTimeRange.IGBO_VOICE_ATHON &&
    !moment().isBetween(igboVoiceathonStartDate, igboVoiceathonEndDate);

  const handleLeaderboardClick = (index: number) => () => {
    setSelectedLeaderboardType(leaderboardItems[index].id);
  };

  const handleBackButton = () => {
    setSelectedLeaderboardType(null);
    setRankings([]);
  };

  const handleSelectTimeRange = (timeRange: LeaderboardTimeRange) => {
    setLeaderboardTimeRange(timeRange);
  };

  const handleRequestingLeaderboard = async () => {
    setIsLoading(true);
    try {
      if (get(cachedFetchedData, `${leaderboardTimeRange}.${selectedLeaderboardType}`)) {
        setUserRanking(cachedFetchedData[leaderboardTimeRange][selectedLeaderboardType].userRanking);
        setRankings(cachedFetchedData[leaderboardTimeRange][selectedLeaderboardType].rankings);
        return;
      }

      const result = await getLeaderboardStats({
        leaderboard: selectedLeaderboardType,
        timeRange: leaderboardTimeRange,
      });
      if (!cachedFetchedData[selectedLeaderboardType]) {
        const filteredRankings = (result.rankings || []).filter(({ position }) => typeof position === 'number');
        act(() => {
          setUserRanking(result.userRanking);
          setRankings(filteredRankings);
        });
        const updatedCachedData = {
          ...cloneDeep(cachedFetchedData),
          [leaderboardTimeRange]: {
            ...cloneDeep(get(cachedFetchedData, leaderboardTimeRange)),
            [selectedLeaderboardType]: { userRanking: result.userRanking, rankings: filteredRankings },
          },
        };
        act(() => {
          setCachedFetchedData(updatedCachedData);
        });
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
      act(() => {
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    if (selectedLeaderboardType) {
      handleRequestingLeaderboard();
    }
  }, [selectedLeaderboardType, leaderboardTimeRange]);

  return !isLoading ? (
    <Box className="p-6">
      <Heading as="h1" fontSize="xl" display="flex" alignItems="center" minHeight={10} mb={2}>
        {selectedLeaderboard ? (
          <IconButton
            variant="ghost"
            aria-label="reset leaderboard option"
            marginRight={2}
            onClick={handleBackButton}
            icon={<Icons.ArrowBack width={6} height={6} stroke="gray.700" />}
          />
        ) : null}
        Leaderboards
      </Heading>
      {selectedLeaderboard ? (
        <Box bg={selectedLeaderboard.styles?.bgColor} w="100%" p={2} fontFamily="Silka">
          <Text fontSize={14} color={selectedLeaderboard.styles?.color} fontWeight="semibold">
            {selectedLeaderboard.title}
          </Text>
          <Text fontSize={12} color={selectedLeaderboard.styles?.color}>
            Total of all your contributions
          </Text>
        </Box>
      ) : null}
      {selectedLeaderboardType ? (
        <>
          <Heading as="h2" fontSize="lg" my={2}>
            Time frames
          </Heading>
          <Box className="grid grid-flow-row grid-cols-2 lg:grid-cols-4 gap-4 my-4">
            {Object.entries(LeaderboardTimeRange)
              // Only shows Igbo Voice-athon for recording audio
              .filter(([, timeRange]) =>
                selectedLeaderboardType === LeaderboardType.RECORD_EXAMPLE_AUDIO
                  ? true
                  : timeRange !== LeaderboardTimeRange.IGBO_VOICE_ATHON,
              )
              .map(([key, value]) => (
                <Tooltip label={LeaderboardTimeRangesMap[value].tooltip} key={value}>
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
        </>
      ) : null}
      {!selectedLeaderboard ? (
        <Grid templateColumns="repeat(2, 1fr)" marginTop={4} gap={4}>
          {leaderboardItems.map(({ children, styles, id }, index) => (
            <LeaderboardRenderer key={id} onClick={handleLeaderboardClick(index)} styles={styles}>
              {children}
            </LeaderboardRenderer>
          ))}
        </Grid>
      ) : null}
      {showIgboVoiceathonMessage ? (
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          <chakra.span fontWeight="bold" mr="1">
            Note:
          </chakra.span>
          Rankings are not accurate for the Igbo Voice-athon because the competition is not active
        </Text>
      ) : null}
      {selectedLeaderboard ? (
        <Box>
          {rankings.map(({ uid, ...rest }) => (
            <LeaderboardUser key={uid} {...rest} />
          ))}
        </Box>
      ) : null}
      <BottomCardRanking {...userRanking} />
    </Box>
  ) : (
    <Spinner />
  );
};

export default Leaderboard;
