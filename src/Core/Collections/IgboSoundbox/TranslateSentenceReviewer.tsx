import React, { ReactElement } from 'react';
import { VStack, Text } from '@chakra-ui/react';
import { get } from 'lodash';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import ReactAudioPlayer from 'react-audio-player';
import ResourceReviewer from 'src/Core/Collections/IgboSoundbox/components/ResourceReviewer';
import { SentenceTranslationVerification } from 'src/Core/Collections/IgboSoundbox/types/SoundboxInterfaces';

const TranslateSentenceReview = ({
  translations,
  review: exampleReview,
  onApprove,
  onDeny,
}: {
  translations: ExampleSuggestion['translations'];
  review: SentenceTranslationVerification;
  onApprove: (translationId: string) => void;
  onDeny: (translationId: string) => void;
}): ReactElement => (
  <VStack width="full" my={2}>
    {translations.map(({ text, language, pronunciations, _id }) => (
      <VStack width="full" backgroundColor="gray.200" borderRadius="md" pt={3}>
        <Text>{text}</Text>
        <Text fontSize="sm" color="gray.600">
          Language: {LanguageLabels[language].label}
        </Text>
        <ResourceReviewer
          onApprove={() => onApprove(_id.toString())}
          onDeny={() => onDeny(_id.toString())}
          reviewAction={exampleReview.reviews[_id.toString()]}
        >
          <VStack>
            <ReactAudioPlayer
              style={{ height: '40px', width: '150px' }}
              id="audio"
              src={get(pronunciations, '[0].audio')}
              controls
            />
          </VStack>
        </ResourceReviewer>
      </VStack>
    ))}
  </VStack>
);

export default TranslateSentenceReview;
