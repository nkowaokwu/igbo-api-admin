import React, { ReactElement, useEffect, useState } from 'react';
import {
  compact,
  last,
  takeRight,
  times,
} from 'lodash';
import {
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import moment from 'moment';
import { DIALECTAL_VARIATIONS_GOAL, EXAMPLE_SENTENCES_GOAL } from 'src/Core/constants';
import LinearProgressCard from '../LinearProgressCard';

const MONTHS_LEFT = moment([2021, 9, 1]).diff(moment([2022, 6, 1]), 'months', true) || 1;
const TEAM_MEMBERS = 4;
const WEEKLY = 4;
const LacunaProgress = ({
  totalDialectalVariations,
  exampleSuggestionMergeStat,
  dialectalVariationMergeStats,
} : {
  totalCompletedWords: number,
  totalCompletedExamples: number,
  totalDialectalVariations: number,
  exampleSuggestionMergeStat?: { datasets: [{ data: number[] }] },
  dialectalVariationMergeStats?: { datasets: [{ data: number[] }] },
}): ReactElement => {
  const [dialectalVariationProgress, setDialectalVariationProgress] = useState({ month: 0, week: 0 });
  const [exampleSentenceProgress, setExampleSentenceProgress] = useState({ month: 0, week: 0 });

  useEffect(() => {
    if (dialectalVariationMergeStats) {
      const CURRENT_WEEKS = compact(times(4, (index) => (
        !!moment().subtract(index, 'week').isSame(moment(), 'month')
      ))).length;
      const monthData = takeRight(dialectalVariationMergeStats.datasets[0].data, CURRENT_WEEKS);
      setDialectalVariationProgress({
        month: monthData.reduce((totalSum, week) => totalSum + week, 0),
        week: last(monthData),
      });
    }
  }, [dialectalVariationMergeStats]);
  useEffect(() => {
    if (exampleSuggestionMergeStat) {
      const CURRENT_WEEKS = moment().week() - moment(moment()).startOf('month').week() + 1;
      const monthData = takeRight(exampleSuggestionMergeStat.datasets[0].data, CURRENT_WEEKS);
      setExampleSentenceProgress({
        month: monthData.reduce((totalSum, week) => totalSum + week, 0),
        week: last(monthData),
      });
    }
  }, [exampleSuggestionMergeStat]);
  return (
    <Box className="mb-6">
      <Box className="flex flex-col items-center text-center my-5">
        <Text fontSize="3xl" fontWeight="bold" fontFamily="Silka">Personal Lacuna Progress</Text>
        <Text fontSize="lg" className="w-11/12 lg:w-8/12 text-gray-800">
          These are your personalized stats for the Lacuna Fund Project
        </Text>
      </Box>
      <Box className="flex flex-col">
        <Box className="space-y-3">
          <Heading as="h2" fontFamily="Silka">Word Stats</Heading>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LinearProgressCard
              totalCount={dialectalVariationProgress.month}
              goal={Math.ceil((totalDialectalVariations - DIALECTAL_VARIATIONS_GOAL) / MONTHS_LEFT / TEAM_MEMBERS)}
              heading={`Dialectal Variations for ${moment().format('MMMM')}`}
              description={`The number of dialectal variations you have contributed for ${moment().format('MMMM')}.`}
              isLoaded
            />
            <LinearProgressCard
              totalCount={dialectalVariationProgress.week}
              goal={Math.ceil((totalDialectalVariations - DIALECTAL_VARIATIONS_GOAL)
                / MONTHS_LEFT / TEAM_MEMBERS / WEEKLY)}
              heading="Dialectal Variations for the Week"
              description="The number of dialectal variations you have contributed for the week"
              isLoaded
            />
          </Box>
        </Box>
        <Box className="space-y-3 mt-4">
          <Heading as="h2">Example Stats</Heading>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LinearProgressCard
              totalCount={exampleSentenceProgress.month}
              goal={Math.ceil((exampleSentenceProgress.month - EXAMPLE_SENTENCES_GOAL) / MONTHS_LEFT / TEAM_MEMBERS)}
              heading={`Example Sentences for ${moment().format('MMMM')}`}
              description={`The number of example sentences you have contributed for ${moment().format('MMMM')}.`}
              isLoaded
            />
            <LinearProgressCard
              totalCount={exampleSentenceProgress.week}
              goal={Math.ceil((exampleSentenceProgress.week - EXAMPLE_SENTENCES_GOAL)
                / MONTHS_LEFT / TEAM_MEMBERS / WEEKLY)}
              heading="Example Sentences for the Week"
              description="The number of example sentences you have contributed for the week"
              isLoaded
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

LacunaProgress.defaultProps = {
  exampleSuggestionMergeStat: { datasets: [{ data: [] }] },
  dialectalVariationMergeStats: { datasets: [{ data: [] }] },
};

export default LacunaProgress;
