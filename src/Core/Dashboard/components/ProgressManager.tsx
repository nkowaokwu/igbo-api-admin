import React, { useState, useEffect, ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import MilestoneProgress from './MilestoneProgress';
import UserStat from './UserStat';

const NO_PERMISSION_STATUS = 403;
const ProgressManager = ({ permissions, user } : { permissions: any, user: { uid: string } }): ReactElement => {
  const [totalSufficientWords, setTotalSufficientWords] = useState(null);
  const [totalCompletedWords, setTotalCompletedWords] = useState(null);
  const [totalSufficientExamples, setTotalSufficientExamples] = useState(null);
  const [totalCompletedExamples, setTotalCompletedExamples] = useState(null);
  const [totalDialectalVariations, setTotalDialectalVariations] = useState(null);
  const [totalHeadwordAudioPronunciation, setTotalHeadwordAudioPronunciation] = useState(null);
  const [totalWordIsStandardIgbo, setTotalWordIsStandardIgbo] = useState(null);
  const [totalWordsWithNsibidi, setTotalWordsWithNsibidi] = useState(null);
  const [totalWordSuggestionsWithNsibidi, setTotalWordSuggestionsWithNsibidi] = useState(null);

  const redirectToLogin = () => {
    window.location.hash = '#/';
  };

  const handleNoPermissionStatus = ({ status }) => {
    if (status === NO_PERMISSION_STATUS) {
      redirectToLogin();
    }
  };

  useEffect(() => {
    network('/stats/full')
      .then(({ body }) => {
        const {
          sufficient_words,
          complete_words,
          dialectal_variations,
          headword_audio_pronunciations,
          standard_igbo,
          sufficient_examples,
          complete_examples,
          nsibidi_words,
          nsibidi_word_suggestions,
        } = JSON.parse(body);
        setTotalSufficientWords(sufficient_words?.value || 0);
        setTotalCompletedWords(complete_words?.value || 0);
        setTotalDialectalVariations(dialectal_variations?.value || 0);
        setTotalHeadwordAudioPronunciation(headword_audio_pronunciations?.value || 0);
        setTotalWordIsStandardIgbo(standard_igbo?.value || 0);
        setTotalSufficientExamples(sufficient_examples?.value || 0);
        setTotalCompletedExamples(complete_examples?.value || 0);
        setTotalWordsWithNsibidi(nsibidi_words?.value || 0);
        setTotalWordSuggestionsWithNsibidi(nsibidi_word_suggestions?.value || 0);
      })
      .catch(handleNoPermissionStatus);
  }, []);

  return (
    <>
      <Box className="mb-24">
        <UserStat
          uid={user?.uid}
          permissions={permissions}
          totalCompletedWords={totalCompletedWords}
          totalCompletedExamples={totalCompletedExamples}
          totalDialectalVariations={totalDialectalVariations}
        />
      </Box>
      <MilestoneProgress
        totalSufficientWords={totalSufficientWords}
        totalCompletedWords={totalCompletedWords}
        totalSufficientExamples={totalSufficientExamples}
        totalCompletedExamples={totalCompletedExamples}
        totalDialectalVariations={totalDialectalVariations}
        totalHeadwordAudioPronunciation={totalHeadwordAudioPronunciation}
        totalWordIsStandardIgbo={totalWordIsStandardIgbo}
        totalWordsWithNsibidi={totalWordsWithNsibidi}
        totalWordSuggestionsWithNsibidi={totalWordSuggestionsWithNsibidi}
      />
    </>
  );
};

export default ProgressManager;
