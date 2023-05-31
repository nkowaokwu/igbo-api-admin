import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box } from '@chakra-ui/react';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import AudioPlayback from './components/AudioPlayback';
import { SentenceVerification } from './types/SentenceVerification';

const SandboxAudioReviewer = ({
  pronunciations,
  review: exampleReview,
  onApprove,
  onDeny,
}: {
  pronunciations: ExampleSuggestion['pronunciations'],
  review?: SentenceVerification,
  onApprove?: (pronunciationId: string) => void,
  onDeny?: (pronunciationId: string) => void,
}): ReactElement => {
  const uid = useFirebaseUid();

  return (
    <Box className="flex flex-col w-full my-2">
      <Box
        data-test="word-pronunciation-input-container"
        width="full"
      >
        {pronunciations && pronunciations.map(({
          audio,
          approvals,
          denials,
          review,
          _id,
        }) => (
          <>
            {review && !approvals.includes(uid) && !denials.includes(uid) ? (
              <AudioPlayback
                pronunciationValue={audio}
                isRecording={false}
                onApprove={onApprove ? () => onApprove(_id.toString()) : noop}
                onDeny={onDeny ? () => onDeny(_id.toString()) : noop}
                reviewAction={exampleReview.reviews[_id.toString()]}
              />
            ) : null}
          </>
        ))}
      </Box>
    </Box>
  );
};

export default SandboxAudioReviewer;
