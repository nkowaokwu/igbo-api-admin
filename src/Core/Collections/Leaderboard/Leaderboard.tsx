import React, { ReactElement, useEffect, useState } from 'react';
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { act } from 'react-dom/test-utils';
import { Box, IconButton, Grid, Heading, Text, useToast, chakra } from '@chakra-ui/react';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { getLeaderboardStats } from 'src/shared/DataCollectionAPI';
import { Spinner } from 'src/shared/primitives';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import LeaderboardUser from 'src/Core/Collections/Leaderboard/LeaderboardUser';
import LeaderboardTimeRange from 'src/backend/shared/constants/LeaderboardTimeRange';
import BottomCardRanking from 'src/Core/Collections/Leaderboard/BottomCardRanking';
import { LeaderboardRenderer } from './components/LeaderboardRenderer';
import { SearchBar } from './components/SearchBar';
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

const Leaderboard = (): ReactElement => {
  const [leaderboardIndex, setLeaderboardIndex] = useState<number | null>();
  const [leaderboardTimeRange] = useState<LeaderboardTimeRange>(LeaderboardTimeRange.ALL_TIME);
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

  const handleLeaderboardClick = (index: number) => () => {
    const leaderboardItem = leaderboardItems[index];
    if (leaderboardItem.uid !== leaderboardItems[leaderboardIndex]?.uid) {
      setLeaderboardIndex(index);
    }
  };

  const handleBackButton = () => {
    setLeaderboardIndex(null);
    setRankings([]);
  };

  const handleRequestingLeaderboard = async () => {
    setIsLoading(true);
    const { uid: leaderboard } = leaderboardItems[leaderboardIndex];
    try {
      if (get(cachedFetchedData, `${leaderboardTimeRange}.${leaderboard}`)) {
        setUserRanking(cachedFetchedData[leaderboardTimeRange][leaderboard].userRanking);
        setRankings(cachedFetchedData[leaderboardTimeRange][leaderboard].rankings);
        return;
      }

      const result = await getLeaderboardStats({ leaderboard, timeRange: leaderboardTimeRange });
      if (!cachedFetchedData[leaderboard]) {
        const filteredRankings = (result.rankings || []).filter(({ position }) => typeof position === 'number');
        act(() => {
          setUserRanking(result.userRanking);
          setRankings(filteredRankings);
        });
        const updatedCachedData = {
          ...cloneDeep(cachedFetchedData),
          [leaderboardTimeRange]: {
            ...cloneDeep(get(cachedFetchedData, leaderboardTimeRange)),
            [leaderboard]: { userRanking: result.userRanking, rankings: filteredRankings },
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
    if (Number.isFinite(leaderboardIndex)) {
      handleRequestingLeaderboard();
    }
  }, [leaderboardIndex]);

  const leaderboardItem = leaderboardItems[leaderboardIndex];
  return !isLoading ? (
    <Box className="p-6">
      <Heading as="h1" fontSize="xl" mb={2}>
        {leaderboardItem && (
          <IconButton
            variant="ghost"
            aria-label="reset leaderboard option"
            marginRight={2}
            onClick={handleBackButton}
            icon={<Icons.ArrowBack width={6} height={6} stroke="rgba(39, 39, 39, 1)" />}
          />
        )}
        Leaderboards
      </Heading>
      <SearchBar />
      {leaderboardItem && (
        <Box bg={leaderboardItem?.styles?.bgColor} w="100%" p={2} fontFamily="Silka">
          <Text fontSize={14} color={leaderboardItem?.styles?.color} fontWeight="semibold">
            {leaderboardItem?.title}
          </Text>
          <Text fontSize={12} color={leaderboardItem?.styles?.color}>
            Total of all your contributions
          </Text>
        </Box>
      )}
      {!leaderboardItem && (
        <Grid templateColumns="repeat(2, 1fr)" marginTop={4} gap={4}>
          {leaderboardItems.map(({ children, styles, uid }, index) => (
            <LeaderboardRenderer key={uid} onClick={handleLeaderboardClick(index)} styles={styles}>
              {children}
            </LeaderboardRenderer>
          ))}
        </Grid>
      )}
      {showIgboVoiceathonMessage ? (
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          <chakra.span fontWeight="bold" mr="1">
            Note:
          </chakra.span>
          Rankings are not accurate for the Igbo Voice-athon because the competition is not active
        </Text>
      ) : null}
      {leaderboardItem && (
        <Box>
          {rankings.map(({ uid, ...rest }) => (
            <LeaderboardUser key={uid} {...rest} />
          ))}
        </Box>
      )}
      <BottomCardRanking {...userRanking} />
    </Box>
  ) : (
    <Spinner />
  );
};

export default Leaderboard;
