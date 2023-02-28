import React, { ReactElement, useEffect, useState } from 'react';
import { last } from 'lodash';
import { Box } from '@chakra-ui/react';
import moment from 'moment';
import { DIALECTAL_VARIATIONS_GOAL, EXAMPLE_SENTENCES_GOAL } from 'src/Core/constants';
import LinearProgressCard from '../LinearProgressCard';

const MONTHS_LEFT = moment().diff(moment([2023, 6, 1]), 'months', true) || 1;
const TEAM_MEMBERS = 4;
const WEEKLY = 4;
const LacunaProgress = ({
  mergeStats,
  currentMonthMergeStats,
} : {
  mergeStats?: { datasets: [{ data: number[] }, { data: number[] }] },
  currentMonthMergeStats?: { exampleSuggestions: number, dialectalVariations: number },
}): ReactElement => {
  const [dialectalVariationProgress, setDialectalVariationProgress] = useState({ month: 0, week: 0 });
  const [exampleSentenceProgress, setExampleSentenceProgress] = useState({ month: 0, week: 0 });

  const monthlyStats = [
    {
      totalCount: dialectalVariationProgress.month,
      goal: Math.ceil((DIALECTAL_VARIATIONS_GOAL - dialectalVariationProgress.month) / MONTHS_LEFT / TEAM_MEMBERS),
      heading: 'Dialectal Variations',
      description: `The number of dialectal variations you have contributed for ${moment().format('MMMM')}.`,
    },
    {
      totalCount: exampleSentenceProgress.month,
      goal: Math.ceil((EXAMPLE_SENTENCES_GOAL - exampleSentenceProgress.month) / MONTHS_LEFT / TEAM_MEMBERS),
      heading: 'Example Sentences',
      description: `The number of example sentences you have contributed for ${moment().format('MMMM')}.`,
    },
  ];

  const weeklyStats = [
    {
      totalCount: dialectalVariationProgress.week,
      goal: Math.ceil((DIALECTAL_VARIATIONS_GOAL - dialectalVariationProgress.week)
        / MONTHS_LEFT / TEAM_MEMBERS / WEEKLY),
      heading: 'Dialectal Variations',
      description: 'The number of dialectal variations you have contributed for the week.',
    },
    {
      totalCount: exampleSentenceProgress.week,
      goal: Math.ceil((EXAMPLE_SENTENCES_GOAL - exampleSentenceProgress.week)
      / MONTHS_LEFT / TEAM_MEMBERS / WEEKLY),
      heading: 'Example Sentences',
      description: 'The number of example sentences you have contributed for the week.',
    },
  ];

  useEffect(() => {
    if (mergeStats && currentMonthMergeStats) {
      setExampleSentenceProgress({
        month: currentMonthMergeStats.exampleSuggestions,
        week: last(mergeStats.datasets[0].data),
      });
      setDialectalVariationProgress({
        month: currentMonthMergeStats.dialectalVariations,
        week: last(mergeStats.datasets[1].data),
      });
    }
  }, [mergeStats, currentMonthMergeStats]);

  return (
    <Box className="mb-6 space-y-3 w-full">
      <LinearProgressCard
        heading={'Lacuna Fund Project "weekly"'}
        description="Your personalized Lacuna Fund statistics"
        stats={weeklyStats}
        isLoaded
      />
      <LinearProgressCard
        heading={'Lacuna Fund Project "monthly"'}
        description="Your personalized Lacuna Fund statistics"
        stats={monthlyStats}
        isLoaded
      />
    </Box>
  );
};

export default LacunaProgress;
