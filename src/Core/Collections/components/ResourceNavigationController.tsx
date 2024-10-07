import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box, HStack, Text, Tooltip } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { ActivityButton } from 'src/shared/primitives';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { SentenceVerification } from 'src/Core/Collections/IgboSoundbox/types/SoundboxInterfaces';
import SubmitBatchButton from 'src/Core/Collections/components/SubmitBatchButton';

const ResourceNavigationController = ({
  index,
  onBack,
  onNext,
  onSkip,
  onComplete,
  resources,
  isCompleteEnabled,
  isLoading,
}: {
  index: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  resources: ExampleSuggestion[] | SentenceVerification[];
  isCompleteEnabled: boolean;
  isLoading: boolean;
}): ReactElement => (
  <Box className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 w-full">
    <HStack gap={4} justifyContent="space-between" width="full">
      <ActivityButton
        tooltipLabel="You will not lose your current progress by going back."
        onClick={index !== 0 ? onBack : noop}
        leftIcon={<ArrowBackIcon />}
        aria-label="Previous sentence"
        isDisabled={index === 0}
        label="Previous"
      />
      <Text fontFamily="Silka" fontWeight="bold">{`${index + 1} / ${resources.length}`}</Text>
      <ActivityButton
        onClick={!resources[index] ? onSkip : index === resources.length - 1 ? noop : onNext}
        rightIcon={<ArrowForwardIcon />}
        aria-label="Next sentence"
        isDisabled={index === resources.length - 1}
        label="Next"
      />
    </HStack>
    <Tooltip label={!isCompleteEnabled ? 'Please record at least one audio to complete this section' : ''}>
      <SubmitBatchButton
        isLoading={isLoading}
        isClickEnabled={isCompleteEnabled}
        onClick={onComplete}
        isDisabled={!isCompleteEnabled}
        aria-label="Complete recordings"
      />
    </Tooltip>
  </Box>
);

export default ResourceNavigationController;
