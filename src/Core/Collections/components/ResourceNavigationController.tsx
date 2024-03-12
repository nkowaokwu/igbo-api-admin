import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { ActivityButton } from 'src/shared/primitives';
import { ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import { SentenceVerification } from 'src/Core/Collections/IgboSoundbox/types/SentenceVerification';

const ResourceNavigationController = ({
  index,
  onBack,
  onNext,
  onSkip,
  resources,
}: {
  index: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  resources: ExampleSuggestion[] | SentenceVerification[];
}): ReactElement => (
  <Box className="mb-12 w-full flex flex-row justify-between items-center space-x-4">
    <ActivityButton
      tooltipLabel="You will not lose your current progress by going back."
      onClick={index !== 0 ? onBack : noop}
      icon={<ArrowBackIcon />}
      aria-label="Previous sentence"
      isDisabled={index === 0}
    />
    <Text fontFamily="Silka" fontWeight="bold">{`${index + 1} / ${resources.length}`}</Text>
    <ActivityButton
      onClick={!resources[index] ? onSkip : index === resources.length - 1 ? noop : onNext}
      icon={<ArrowForwardIcon />}
      colorScheme="purple"
      aria-label="Next sentence"
      isDisabled={index === resources.length - 1}
    />
  </Box>
);

export default ResourceNavigationController;
