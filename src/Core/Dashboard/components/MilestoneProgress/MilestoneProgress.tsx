import React, { ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import {
  SUFFICIENT_WORDS_GOAL,
  COMPLETE_WORDS_GOAL,
  DIALECTAL_VARIATIONS_GOAL,
  HEADWORD_AUDIO_PRONUNCIATION_GOAL,
  WORDS_WITH_NSIBIDI_GOAL,
  WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL,
  IS_STANDARD_IGBO_GOAL,
  IGBO_DEFINITIONS_GOAL,
  EXAMPLE_SENTENCES_GOAL,
} from 'src/Core/constants';
import LinearProgressCard from '../LinearProgressCard';

const MilestoneProgress = ({
  totalSufficientWords,
  totalCompletedWords,
  totalSufficientExamples,
  totalCompletedExamples,
  totalDialectalVariations,
  totalHeadwordAudioPronunciation,
  totalWordIsStandardIgbo,
  totalWordsWithIgboDefinitions,
  totalWordsWithNsibidi,
  totalWordSuggestionsWithNsibidi,
}: {
  totalSufficientWords: number,
  totalCompletedWords: number,
  totalSufficientExamples: number,
  totalCompletedExamples: number,
  totalDialectalVariations: number,
  totalHeadwordAudioPronunciation: number,
  totalWordIsStandardIgbo: number,
  totalWordsWithIgboDefinitions: number,
  totalWordsWithNsibidi: number,
  totalWordSuggestionsWithNsibidi: number,
}): ReactElement => {
  const wordStats = [
    {
      totalCount: totalSufficientWords,
      goal: SUFFICIENT_WORDS_GOAL,
      heading: '"Sufficient" Words',
      description: `There are currently ${totalSufficientWords} "sufficient" words on the platform.
      Our goal is reach a total of ${SUFFICIENT_WORDS_GOAL} "sufficient" words.`,
    }, {
      totalCount: totalCompletedWords,
      goal: COMPLETE_WORDS_GOAL,
      heading: '"Complete" Words',
      description: `There are currently ${totalCompletedWords} "complete" words on the platform.
      Our goal is reach a total of ${COMPLETE_WORDS_GOAL} "complete" words.`,
    }, {
      totalCount: totalDialectalVariations,
      goal: DIALECTAL_VARIATIONS_GOAL,
      heading: 'Dialectal Variations',
      description: `There are currently ${totalDialectalVariations} dialectal word variations on the platform.
      Our goal is reach a total of ${DIALECTAL_VARIATIONS_GOAL} "complete" words.`,
    }, {
      totalCount: totalHeadwordAudioPronunciation,
      goal: HEADWORD_AUDIO_PRONUNCIATION_GOAL,
      heading: 'Headwords with Audio Pronunciations',
      description: `There are currently ${totalHeadwordAudioPronunciation} headwords 
      with audio pronunciations on the platform.
      Our next goal is to record a total of ${HEADWORD_AUDIO_PRONUNCIATION_GOAL} headwords.`,
    }, {
      totalCount: totalWordIsStandardIgbo,
      goal: IS_STANDARD_IGBO_GOAL,
      heading: 'Standard Igbo Words',
      description: `There are currently ${totalWordIsStandardIgbo} words marked as Standard Igbo 
      on the platform. Our next goal is to mark a total of ${IS_STANDARD_IGBO_GOAL} words.`,
    }, {
      totalCount: totalWordsWithIgboDefinitions,
      goal: IGBO_DEFINITIONS_GOAL,
      heading: 'Words with Igbo Definitions',
      description: `There are currently ${totalWordsWithIgboDefinitions} words with at least one Igbo definition 
      on the platform. Our next goal is to mark a total of ${IGBO_DEFINITIONS_GOAL} words.`,
    },
  ];

  const nsibidiStats = [
    {
      totalCount: totalWordsWithNsibidi,
      goal: WORDS_WITH_NSIBIDI_GOAL,
      heading: 'Words with Nsịbịdị',
      description: `There are currently ${totalWordsWithNsibidi} words with Nsịbịdị on the platform. 
      Our next goal is to record a total of ${WORDS_WITH_NSIBIDI_GOAL} words with Nsịbịdị.`,
    },
    {
      totalCount: totalWordSuggestionsWithNsibidi,
      goal: WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL,
      heading: 'Word Suggestions with Nsịbịdị',
      description: `There are currently ${totalWordSuggestionsWithNsibidi} word suggestions 
      with Nsịbịdị on the platform. Our next goal is to record a total of 
      ${WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL} word suggestions with Nsịbịdị.`,
    },
  ];

  const exampleStats = [
    {
      totalCount: totalSufficientExamples,
      goal: EXAMPLE_SENTENCES_GOAL,
      heading: 'Sufficient Igbo Example Sentences',
      description: `There are currently ${totalSufficientExamples} sufficient example 
      sentences on the platform. Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} 
      sufficient example sentences.`,
    },
    {
      totalCount: totalCompletedExamples,
      goal: EXAMPLE_SENTENCES_GOAL,
      heading: 'Complete Igbo Example Sentences',
      description: `There are currently ${totalCompletedExamples} complete example sentences on the platform.
      Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} complete example sentences.`,
    },
  ];

  const isWordStatsLoaded = (
    totalSufficientWords !== null
    && totalCompletedWords !== null
    && totalDialectalVariations !== null
    && totalHeadwordAudioPronunciation !== null
    && totalWordIsStandardIgbo !== null
    && totalWordsWithIgboDefinitions !== null
  );
  const isNsibidiStatsLoaded = totalWordsWithNsibidi !== null && totalWordSuggestionsWithNsibidi !== null;
  const isExampleStatsLoaded = totalSufficientExamples !== null && totalCompletedExamples !== null;

  return (
    <Box className="space-y-3">
      <Box
        borderRadius="md"
        borderWidth="1"
        borderColor="gray.200"
        backgroundColor="white"
        p={3}
      >
        <Box className="my-5">
          <Text fontSize="xl" fontWeight="bold" fontFamily="Silka">Community Milestone Statistics</Text>
          <Text fontFamily="Silka">
            Track the total progress of the Igbo API.
          </Text>
        </Box>
        <Box className="space-y-3">
          <LinearProgressCard
            heading="Word Stats"
            stats={wordStats}
            isLoaded={isWordStatsLoaded}
          />
          <LinearProgressCard
            stats={nsibidiStats}
            heading="Nsịbịdị Stats"
            isLoaded={isNsibidiStatsLoaded}
          />
          <LinearProgressCard
            heading="Example Stats"
            stats={exampleStats}
            isLoaded={isExampleStatsLoaded}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MilestoneProgress;
