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
  PROVERBS_GOAL,
} from 'src/Core/constants';
import LinearProgressCard from '../LinearProgressCard';

const MilestoneProgress = ({
  sufficientWords,
  completeWords,
  sufficientExamples,
  proverbExamples,
  completeExamples,
  dialectalVariations,
  headwordAudioPronunciations,
  standardIgbo,
  igboDefinitions,
  nsibidiWords,
  nsibidiWordSuggestions,
}: {
  sufficientWords: number;
  completeWords: number;
  sufficientExamples: number;
  proverbExamples: number;
  completeExamples: number;
  dialectalVariations: number;
  headwordAudioPronunciations: number;
  standardIgbo: number;
  igboDefinitions: number;
  wordsWithIgboDefinitions: number;
  nsibidiWords: number;
  nsibidiWordSuggestions: number;
}): ReactElement => {
  const wordStats = [
    {
      totalCount: sufficientWords,
      goal: SUFFICIENT_WORDS_GOAL,
      heading: '"Sufficient" Words',
      description: `There are currently ${sufficientWords} "sufficient" words on the platform.
      Our goal is reach a total of ${SUFFICIENT_WORDS_GOAL} "sufficient" words.`,
    },
    {
      totalCount: completeWords,
      goal: COMPLETE_WORDS_GOAL,
      heading: '"Complete" Words',
      description: `There are currently ${completeWords} "complete" words on the platform.
      Our goal is reach a total of ${COMPLETE_WORDS_GOAL} "complete" words.`,
    },
    {
      totalCount: dialectalVariations,
      goal: DIALECTAL_VARIATIONS_GOAL,
      heading: 'Dialectal Variations',
      description: `There are currently ${dialectalVariations} dialectal word variations on the platform.
      Our goal is reach a total of ${DIALECTAL_VARIATIONS_GOAL} "complete" words.`,
    },
    {
      totalCount: headwordAudioPronunciations,
      goal: HEADWORD_AUDIO_PRONUNCIATION_GOAL,
      heading: 'Headwords with Audio Pronunciations',
      description: `There are currently ${headwordAudioPronunciations} headwords 
      with audio pronunciations on the platform.
      Our next goal is to record a total of ${HEADWORD_AUDIO_PRONUNCIATION_GOAL} headwords.`,
    },
    {
      totalCount: standardIgbo,
      goal: IS_STANDARD_IGBO_GOAL,
      heading: 'Standard Igbo Words',
      description: `There are currently ${standardIgbo} words marked as Standard Igbo 
      on the platform. Our next goal is to mark a total of ${IS_STANDARD_IGBO_GOAL} words.`,
    },
    {
      totalCount: igboDefinitions,
      goal: IGBO_DEFINITIONS_GOAL,
      heading: 'Words with Igbo Definitions',
      description: `There are currently ${igboDefinitions} words with at least one Igbo definition 
      on the platform. Our next goal is to mark a total of ${IGBO_DEFINITIONS_GOAL} words.`,
    },
  ];

  const nsibidiStats = [
    {
      totalCount: nsibidiWords,
      goal: WORDS_WITH_NSIBIDI_GOAL,
      heading: 'Words with Nsịbịdị',
      description: `There are currently ${nsibidiWords} words with Nsịbịdị on the platform. 
      Our next goal is to record a total of ${WORDS_WITH_NSIBIDI_GOAL} words with Nsịbịdị.`,
    },
    {
      totalCount: nsibidiWordSuggestions,
      goal: WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL,
      heading: 'Word Suggestions with Nsịbịdị',
      description: `There are currently ${nsibidiWordSuggestions} word suggestions 
      with Nsịbịdị on the platform. Our next goal is to record a total of 
      ${WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL} word suggestions with Nsịbịdị.`,
    },
  ];

  const exampleStats = [
    {
      totalCount: sufficientExamples,
      goal: EXAMPLE_SENTENCES_GOAL,
      heading: 'Sufficient Igbo Example Sentences',
      description: `There are currently ${sufficientExamples} sufficient example 
      sentences on the platform. Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} 
      sufficient example sentences.`,
    },
    {
      totalCount: completeExamples,
      goal: EXAMPLE_SENTENCES_GOAL,
      heading: 'Complete Igbo Example Sentences',
      description: `There are currently ${completeExamples} complete example sentences on the platform.
      Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} complete example sentences.`,
    },
    {
      totalCount: proverbExamples,
      goal: PROVERBS_GOAL,
      heading: 'Igbo Proverbs Example Sentences',
      description: `There are currently ${proverbExamples} complete example sentences on the platform.
      Our next goal is to mark a total of ${PROVERBS_GOAL} complete example sentences.`,
    },
  ];

  const isWordStatsLoaded =
    sufficientWords !== null &&
    completeWords !== null &&
    dialectalVariations !== null &&
    headwordAudioPronunciations !== null &&
    standardIgbo !== null &&
    igboDefinitions !== null;
  const isNsibidiStatsLoaded = nsibidiWords !== null && nsibidiWordSuggestions !== null;
  const isExampleStatsLoaded = sufficientExamples !== null && completeExamples !== null && proverbExamples !== null;

  return (
    <Box className="space-y-3 w-full">
      <Box borderRadius="md" borderWidth="1" borderColor="gray.200" backgroundColor="white" p={3}>
        <Box className="my-5">
          <Text fontSize="xl" fontWeight="bold" fontFamily="Silka">
            Community Milestone Statistics
          </Text>
          <Text fontFamily="Silka">Track the total progress of the Igbo API.</Text>
        </Box>
        <Box className="space-y-3">
          <LinearProgressCard heading="Word Stats" stats={wordStats} isLoaded={isWordStatsLoaded} />
          <LinearProgressCard stats={nsibidiStats} heading="Nsịbịdị Stats" isLoaded={isNsibidiStatsLoaded} />
          <LinearProgressCard heading="Example Stats" stats={exampleStats} isLoaded={isExampleStatsLoaded} />
        </Box>
      </Box>
    </Box>
  );
};

export default MilestoneProgress;
