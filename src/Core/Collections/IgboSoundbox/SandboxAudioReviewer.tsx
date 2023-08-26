import React, { ReactElement, useState } from 'react';
import { noop } from 'lodash';
import { Box } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import AudioPlayback from './components/AudioPlayback';
import { SentenceVerification } from './types/SentenceVerification';

const SandboxAudioReviewer = ({
  pronunciations,
  review: exampleReview,
  onApprove,
  onDeny,
}: {
  pronunciations: ExampleSuggestion['pronunciations'];
  review?: SentenceVerification;
  onApprove?: (pronunciationId: string) => void;
  onDeny?: (pronunciationId: string) => void;
}): ReactElement => {
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(false);
  const uid = useFirebaseUid();
  const permissions = usePermissions();
  const speakerIds = pronunciations.map(({ speaker: speakerId }) => speakerId);
  const speakers = useFetchSpeakers({ permissions, setIsLoading: setIsLoadingSpeakers, speakerIds });

  return permissions?.loaded ? (
    <Box className="flex flex-col w-full my-2">
      <Box data-test="word-pronunciation-input-container" width="full">
        {pronunciations &&
          pronunciations.map(({ audio, approvals, denials, review, _id }, index) => (
            <Box key={`soundbox-audio-reviewer-${_id}`}>
              {review && !approvals.includes(uid) && !denials.includes(uid) ? (
                <>
                  <AudioPlayback
                    pronunciationValue={audio}
                    isRecording={false}
                    onApprove={onApprove ? () => onApprove(_id.toString()) : noop}
                    onDeny={onDeny ? () => onDeny(_id.toString()) : noop}
                    reviewAction={exampleReview.reviews[_id.toString()]}
                  />
                  <SpeakerNameManager isLoading={isLoadingSpeakers} speakers={speakers} index={index} />
                </>
              ) : null}
            </Box>
          ))}
      </Box>
    </Box>
  ) : null;
};

export default SandboxAudioReviewer;
