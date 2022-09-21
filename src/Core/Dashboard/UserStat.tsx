import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Text,
  Skeleton,
  chakra,
} from '@chakra-ui/react';
import network from './network';

const userStatBodies = {
  approvedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"approvals"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total approved word suggestions',
  },
  deniedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"denials"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total denied word suggestions',
  },
  approvedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"approvals"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total approved example suggestions',
  },
  deniedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"denials"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total denied example suggestions',
  },
  authoredWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total authored word suggestions',
  },
  authoredExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total authored exampled suggestions',
  },
  mergedWordSuggestionsCount: {
    label: 'Total merged word suggestions',
  },
  mergedExampleSuggestionsCount: {
    label: 'Total merged exampled suggestions',
  },
  currentEditingWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"userInteractions"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total currently editing word suggestions',
  },
  currentEditingExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"userInteractions"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total currently editing example suggestions',
  },
};

const UserStat = ({ uid } : { uid?: string }): ReactElement => {
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await network(uid ? `/stats/user/${uid}` : '/stats/user');
      setUserStats(res.json);
    })();
  }, []);

  return (
    <Skeleton isLoaded={userStats} minHeight={32}>
      <Box className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(userStats || {}).map(([key, value]) => (
          <Box
            className={`flex justify-center items-center rounded-lg bg-white
            shadow-sm p-4 transition-all duration-200 border border-gray-200
            ${userStatBodies[key].hash ? 'cursor-pointer hover:bg-blue-100' : ''}`}
            onClick={() => {
              if (userStatBodies[key].hash) {
                window.location.hash = userStatBodies[key].hash;
              }
            }}
          >
            <Text key={key}>
              <chakra.span fontWeight="bold">{`${userStatBodies[key].label}: `}</chakra.span>
              {`${value}`}
            </Text>
          </Box>
        ))}
      </Box>
    </Skeleton>
  );
};

export default UserStat;
