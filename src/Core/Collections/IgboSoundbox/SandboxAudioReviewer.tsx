import React, { ReactElement, useState } from 'react';
import { noop } from 'lodash';
import { Box, chakra } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import { PronunciationSchema } from 'src/backend/controllers/utils/interfaces';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import SpeakerNameManager from 'src/Core/Collections/components/SpeakerNameManager/SpeakerNameManager';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import ResourceReviewer from './components/ResourceReviewer';
import { SentenceVerification } from './types/SoundboxInterfaces';

const SandboxAudioReviewer = ({
  pronunciations,
  review: exampleReview,
  onApprove,
  onDeny,
}: {
  pronunciations: PronunciationSchema[];
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
                  <ResourceReviewer
                    onApprove={onApprove ? () => onApprove(_id.toString()) : noop}
                    onDeny={onDeny ? () => onDeny(_id.toString()) : noop}
                    reviewAction={exampleReview.reviews[_id.toString()]}
                  >
                    {audio ? (
                      <ReactAudioPlayer
                        style={{
                          height: '40px',
                          width: '250px',
                        }}
                        id="audio"
                        src={audio}
                        controls
                      />
                    ) : (
                      <chakra.span className="text-green-500 mt-2">New pronunciation recorded</chakra.span>
                    )}
                  </ResourceReviewer>
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
