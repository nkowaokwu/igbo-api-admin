import React, { ReactElement, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Heading,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';
import LeaderboardType from 'src/backend/shared/constants/LeaderboardType';
import { getLeaderboardStats } from 'src/shared/DataCollectionAPI';
import { Spinner } from 'src/shared/primitives';
import { UserRanking } from 'src/backend/controllers/utils/interfaces';
import { cloneDeep } from 'lodash';

type CachedRankings = {
  [leaderboard in LeaderboardType]: {
    userRanking: UserRanking
    rankings: UserRanking[],
  }
};

const LeaderboardUser = ({
  displayName,
  photoURL,
  count,
  position,
} : {
  displayName: string,
  photoURL: string,
  email: string,
  count: number,
  position: number,
}) => (
  <Box
    className="flex flex-row space-x-3 justify-between items-center my-4 py-4"
    borderBottomWidth="1px"
    borderBottomColor="gray.300"
  >
    <Box className="flex flex-row space-x-3 items-center">
      <Text fontWeight="bold" color="gray.700">{`${position}.`}</Text>
      <Box>
        <Box className="flex flex-row space-x-2 items-center">
          <Avatar src={photoURL} name={displayName} size="sm" />
          <Box>
            <Text fontWeight="bold">{displayName}</Text>
            <Text color="gray.500">{`${count} points`}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
    {position <= 3 ? (
      <Text fontSize="2xl">
        {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
      </Text>
    ) : null}
  </Box>
);

const BottomCardRanking = ({
  displayName,
  photoURL,
  count,
  position,
} : {
  displayName: string,
  photoURL: string,
  email: string,
  count: number,
  position: number,
}) => (
  <Box
    position="fixed"
    bottom={0}
    left={0}
    className="w-full h-18 p-2"
    boxShadow="0px -2px 5px var(--chakra-colors-gray-300)"
  >
    <Box className="flex flex-row space-x-3 items-center">
      {typeof position === 'number' ? <Text fontWeight="bold" color="gray.700">{`${position}.`}</Text> : null}
      <Box>
        <Box className="flex flex-row space-x-2 items-center">
          <Avatar src={photoURL} name={displayName} size="sm" />
          <Box>
            {typeof position === 'number' ? (
              <>
                <Text fontWeight="bold" fontSize="sm">{displayName}</Text>
                <Text color="gray.500" fontSize="sm">{`${count} points`}</Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold" fontSize="sm">No available rank</Text>
                <Text color="gray.500" fontSize="sm">Please make a contribution to see your rank</Text>
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
  const [isLoading, setIsLoading] = useState(false);
  const [userRanking, setUserRanking] = useState<UserRanking>({} as UserRanking);
  const [rankings, setRankings] = useState([]);
  const [cachedFetchedData, setCachedFetchedData] = useState<CachedRankings>({} as CachedRankings);
  const toast = useToast();

  const handleUpdateLeaderboard = (event) => {
    const updatedLeaderboard = event.target.value as LeaderboardType;
    if (leaderboard !== updatedLeaderboard) {
      setLeaderboard(updatedLeaderboard);
    }
  };
  const handleRequestingLeaderboard = async () => {
    setIsLoading(true);
    try {
      if (cachedFetchedData[leaderboard]) {
        setUserRanking(cachedFetchedData[leaderboard].userRanking);
        setRankings(cachedFetchedData[leaderboard].rankings);
        return;
      }

      const result = await getLeaderboardStats(leaderboard);
      if (!cachedFetchedData[leaderboard]) {
        const filteredRankings = (result.rankings || []).filter(({ position }) => typeof position === 'number');
        setUserRanking(result.userRanking);
        setRankings(filteredRankings);
        const updatedCachedData = {
          ...cloneDeep(cachedFetchedData),
          [leaderboard]: { userRanking: result.userRanking, rankings: filteredRankings },
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

  useEffect(() => {
    handleRequestingLeaderboard();
  }, [leaderboard]);

  return !isLoading ? (
    <Box className="p-6">
      <Heading as="h1" fontSize="xl" mb={2}>Leaderboards</Heading>
      <Select defaultValue={leaderboard} onChange={handleUpdateLeaderboard}>
        <option value={LeaderboardType.RECORD_EXAMPLE_AUDIO}>
          Recorded example audio
        </option>
        <option value={LeaderboardType.VERIFY_EXAMPLE_AUDIO}>
          Verified example audio
        </option>
      </Select>
      <Box>
        {rankings.map(({ uid, ...rest }) => (
          <LeaderboardUser key={uid} {...rest} />
        ))}
      </Box>
      <BottomCardRanking {...userRanking} />
    </Box>
  ) : <Spinner />;
};

export default Leaderboard;
