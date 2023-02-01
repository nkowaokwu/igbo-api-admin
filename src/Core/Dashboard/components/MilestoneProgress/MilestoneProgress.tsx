import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
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
import ProgressCard from '../ProgressCard';

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
} : {
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
}): ReactElement => (
  <>
    <Box className="flex flex-col items-center text-center my-5">
      <Text fontSize="3xl" fontWeight="bold" fontFamily="Silka">Community Milestone Progress</Text>
      <Text fontSize="lg" className="w-11/12 lg:w-8/12 text-gray-800">
        {`We are building the most robust Igbo-English dictionary. 
        Here is the progress that we've all made so far!`}
      </Text>
    </Box>
    <Box className="flex flex-col">
      <Box className="space-y-3">
        <Heading as="h2" fontFamily="Silka">Word Stats</Heading>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressCard
            totalCount={totalSufficientWords}
            goal={SUFFICIENT_WORDS_GOAL}
            heading={'"Sufficient" Words'}
            description={`There are currently ${totalSufficientWords} "sufficient" words on the platform.
            Our goal is reach a total of ${SUFFICIENT_WORDS_GOAL} "sufficient" words.`}
            isLoaded={totalSufficientWords !== null}
          />
          <ProgressCard
            totalCount={totalCompletedWords}
            goal={COMPLETE_WORDS_GOAL}
            heading={'"Complete" Words'}
            description={`There are currently ${totalCompletedWords} "complete" words on the platform.
            Our goal is reach a total of ${COMPLETE_WORDS_GOAL} "complete" words.`}
            isLoaded={totalCompletedWords !== null}
          />
          <ProgressCard
            totalCount={totalDialectalVariations}
            goal={DIALECTAL_VARIATIONS_GOAL}
            heading="Dialectal Variations"
            description={`There are currently ${totalDialectalVariations} dialectal word variations on the platform.
            Our goal is reach a total of ${DIALECTAL_VARIATIONS_GOAL} "complete" words.`}
            isLoaded={totalDialectalVariations !== null}
          />
          <ProgressCard
            totalCount={totalHeadwordAudioPronunciation}
            goal={HEADWORD_AUDIO_PRONUNCIATION_GOAL}
            heading="Headwords with Audio Pronunciations"
            description={`There are currently ${totalHeadwordAudioPronunciation} headwords 
            with audio pronunciations on the platform.
            Our next goal is to record a total of ${HEADWORD_AUDIO_PRONUNCIATION_GOAL} headwords.`}
            isLoaded={totalHeadwordAudioPronunciation !== null}
          />
          <ProgressCard
            totalCount={totalWordIsStandardIgbo}
            goal={IS_STANDARD_IGBO_GOAL}
            heading="Standard Igbo Words"
            description={`There are currently ${totalWordIsStandardIgbo} words marked as Standard Igbo 
            on the platform. Our next goal is to mark a total of ${IS_STANDARD_IGBO_GOAL} words.`}
            isLoaded={totalWordIsStandardIgbo !== null}
          />
          <ProgressCard
            totalCount={totalWordsWithIgboDefinitions}
            goal={IGBO_DEFINITIONS_GOAL}
            heading="Words with Igbo Definitions"
            description={`There are currently ${totalWordsWithIgboDefinitions} words with at least one Igbo definition 
            on the platform. Our next goal is to mark a total of ${IGBO_DEFINITIONS_GOAL} words.`}
            isLoaded={totalWordsWithIgboDefinitions !== null}
          />
        </Box>
      </Box>
      <Box className="flex flex-col lg:flex-row lg:space-x-6 my-3">
        <Box className="space-y-3">
          <Heading as="h2">Nsịbịdị Stats</Heading>
          <Box className="flex flex-col space-y-4">
            <ProgressCard
              totalCount={totalWordsWithNsibidi}
              goal={WORDS_WITH_NSIBIDI_GOAL}
              heading="Words with Nsịbịdị"
              description={`There are currently ${totalWordsWithNsibidi} words with Nsịbịdị on the platform. 
              Our next goal is to record a total of ${WORDS_WITH_NSIBIDI_GOAL} words with Nsịbịdị.`}
              isLoaded={totalWordsWithNsibidi !== null}
            />
            <ProgressCard
              totalCount={totalWordSuggestionsWithNsibidi}
              goal={WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL}
              heading="Word Suggestions with Nsịbịdị"
              description={`There are currently ${totalWordSuggestionsWithNsibidi} word suggestions 
              with Nsịbịdị on the platform. Our next goal is to record a total of 
              ${WORD_SUGGESTIONS_WITH_NSIBIDI_GOAL} word suggestions with Nsịbịdị.`}
              isLoaded={totalWordSuggestionsWithNsibidi !== null}
            />
          </Box>
        </Box>
        <Box className="space-y-3">
          <Heading as="h2">Example Stats</Heading>
          <Box className="flex flex-col space-y-4">
            <ProgressCard
              totalCount={totalSufficientExamples}
              goal={EXAMPLE_SENTENCES_GOAL}
              heading="Sufficient Igbo Example Sentences"
              description={`There are currently ${totalSufficientExamples} sufficient example 
              sentences on the platform. Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} 
              sufficient example sentences.`}
              isLoaded={totalSufficientExamples !== null}
            />
            <ProgressCard
              totalCount={totalCompletedExamples}
              goal={EXAMPLE_SENTENCES_GOAL}
              heading="Complete Igbo Example Sentences"
              description={`There are currently ${totalCompletedExamples} complete example sentences on the platform.
              Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} complete example sentences.`}
              isLoaded={totalCompletedExamples !== null}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  </>
);

export default MilestoneProgress;
