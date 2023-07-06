import React, { ReactElement, useState, useEffect } from 'react';
import { noop } from 'lodash';
import { usePermissions } from 'react-admin';
import { Box, Text, Link, Tooltip, chakra } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { ExampleSuggestion, FormattedUser } from 'src/backend/controllers/utils/interfaces';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { getUserProfile } from 'src/shared/UserAPI';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import SpeakerOptions from 'src/Core/Collections/IgboSoundbox/components/SpeakerOptions';
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
  const [speakers, setSpeakers] = useState<null | FormattedUser[]>(null);
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(false);
  const permissions = usePermissions();
  const isAdmin = permissions?.permissions?.role === UserRoles.ADMIN;
  const uid = useFirebaseUid();

  useEffect(() => {
    (async () => {
      if (isAdmin) {
        setIsLoadingSpeakers(true);
        try {
          const speakerProfiles = await Promise.all(
            pronunciations.map(({ speaker: speakerId }) => getUserProfile(speakerId)),
          );
          setSpeakers(speakerProfiles);
        } catch (err) {
          setSpeakers([]);
        } finally {
          setIsLoadingSpeakers(false);
        }
      }
    })();
  }, [permissions]);

  return permissions?.loaded ? (
    <Box className="flex flex-col w-full my-2">
      <Box data-test="word-pronunciation-input-container" width="full">
        {pronunciations &&
          pronunciations.map(({ audio, approvals, denials, review, _id }, index) => {
            const currentSpeaker = isAdmin ? (speakers || [])[index] : null;
            return (
              <>
                {review && !approvals.includes(uid) && !denials.includes(uid) ? (
                  <>
                    <AudioPlayback
                      pronunciationValue={audio}
                      isRecording={false}
                      onApprove={onApprove ? () => onApprove(_id.toString()) : noop}
                      onDeny={onDeny ? () => onDeny(_id.toString()) : noop}
                      reviewAction={exampleReview.reviews[_id.toString()]}
                    />
                    {!isLoadingSpeakers ? (
                      <Box
                        className={`w-full flex flex-row ${isAdmin ? 'justify-between' : 'justify-end'} items-center`}
                      >
                        <chakra.span fontSize="xs" color="gray.500">
                          <chakra.span mr={1}>Speaker:</chakra.span>
                          {currentSpeaker ? (
                            <Tooltip label="Click to view user profile">
                              <Link
                                color="gray.500"
                                fontStyle="italic"
                                target="_blank"
                                textDecoration="underline"
                                href={`#/${Collections.USERS}/${currentSpeaker.uid}/${Views.SHOW}`}
                              >
                                {currentSpeaker?.displayName || 'N/A'}

                                <ExternalLinkIcon boxSize="3" color="gray.500" ml={1} />
                              </Link>
                            </Tooltip>
                          ) : (
                            <chakra.span>N/A</chakra.span>
                          )}
                        </chakra.span>
                        <SpeakerOptions uid={currentSpeaker?.uid} displayName={currentSpeaker?.displayName} />
                      </Box>
                    ) : (
                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                        Loading speaker name...
                      </Text>
                    )}
                  </>
                ) : null}
              </>
            );
          })}
      </Box>
    </Box>
  ) : null;
};

export default SandboxAudioReviewer;
