import React, { ReactElement } from 'react';
import { Box, IconButton, Tooltip } from '@chakra-ui/react';
import ReactAudioPlayer from 'react-audio-player';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';

const AudioPlayback = ({
  pronunciationValue,
  isRecording,
  onApprove,
  onDeny,
  reviewAction,
} : {
  pronunciationValue: string,
  isRecording: boolean,
  onApprove: () => void,
  onDeny: () => void,
  reviewAction: ReviewActions,
}): ReactElement => (
  <Box
    className="text-center flex flex-row justify-center w-full"
    backgroundColor="gray.200"
    borderRadius="md"
    my={3}
    p={3}
  >
    {pronunciationValue && !isRecording ? (
      <Box className="flex flex-row justify-between">
        <Tooltip label="Deny audio pronunciation">
          <IconButton
            onClick={onDeny}
            icon={
              reviewAction === ReviewActions.DENY
                ? <ThumbDownAltIcon sx={{ color: 'var(--chakra-colors-red-500)' }} />
                : <ThumbDownOffAltIcon sx={{ color: 'var(--chakra-colors-red-500)' }} />
            }
            aria-label={`Deny${reviewAction === ReviewActions.DENY ? ' selected' : ''}`}
            variant="ghost"
            _hover={{
              backgroundColor: 'transparent',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
            _focus={{
              backgroundColor: 'transparent',
            }}
          />
        </Tooltip>
        <ReactAudioPlayer
          style={{
            height: '40px',
            width: '250px',
          }}
          id="audio"
          src={pronunciationValue}
          controls
        />
        <Tooltip label="Approve audio pronunciation">
          <IconButton
            onClick={onApprove}
            icon={
              reviewAction === ReviewActions.APPROVE
                ? <ThumbUpAltIcon sx={{ color: 'var(--chakra-colors-green-500)' }} />
                : <ThumbUpOffAltIcon sx={{ color: 'var(--chakra-colors-green-500)' }} />
            }
            aria-label={`Approve${reviewAction === ReviewActions.APPROVE ? ' selected' : ''}`}
            variant="ghost"
            _hover={{
              backgroundColor: 'transparent',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
            _focus={{
              backgroundColor: 'transparent',
            }}
          />
        </Tooltip>
        {!pronunciationValue && (
          <span className="text-green-500 mt-2">New pronunciation recorded</span>
        )}
      </Box>
    ) : <span className="text-gray-700 italic">No audio pronunciation</span>}
  </Box>
);

export default AudioPlayback;
