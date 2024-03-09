import React, { ReactElement, useEffect } from 'react';
import { noop } from 'lodash';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';

const CrowdsourcingSubtitle = {
  [CrowdsourcingType.RECORD_EXAMPLE_AUDIO]: 'Your sentence recordings have been submitted.',
  [CrowdsourcingType.VERIFY_EXAMPLE_AUDIO]: 'Your sentence reviews have been submitted.',
  [CrowdsourcingType.INPUT_IGBO_DEFINITION]: 'Your Igbo definitions have been submitted.',
  [CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]: 'Your English translations have been submitted.',
  [CrowdsourcingType.UPLOAD_TEXT_IMAGE]: 'Your images and transcriptions have been submitted.',
};

const CrowdsourcingNextStep = {
  [CrowdsourcingType.RECORD_EXAMPLE_AUDIO]: 'Record more sentences 🎙',
  [CrowdsourcingType.VERIFY_EXAMPLE_AUDIO]: 'Review more sentences ✅',
  [CrowdsourcingType.INPUT_IGBO_DEFINITION]: 'Add more Igbo definitions ✍🏾',
  [CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]: 'Add more English translations ➡️',
  [CrowdsourcingType.UPLOAD_TEXT_IMAGE]: 'Upload more Igbo text images ⬆️',
};

const Completed = ({
  setIsComplete,
  setIsDirty = noop,
  type,
}: {
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  type: CrowdsourcingType;
  setIsDirty?: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement => {
  const handleMore = () => {
    setIsComplete(false);
  };

  const goHome = () => {
    window.location.search = '';
    window.location.hash = '#/';
  };

  useEffect(() => {
    setIsDirty(false);
  }, []);
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className="space-y-12 h-full"
    >
      <Box className="space-y-4">
        <Heading textAlign="center">Great work!</Heading>
        <Text textAlign="center">
          {CrowdsourcingSubtitle[type] || 'Your Igbo definition reviews have been submitted.'}
        </Text>
      </Box>
      <Box
        className="space-x-3 w-full flex flex-col lg:flex-row 
      justify-center items-center flex-wrap space-y-4 lg:space-y-0"
      >
        <Button colorScheme="purple" borderRadius="full" fontFamily="Silka" fontWeight="bold" onClick={handleMore}>
          {CrowdsourcingNextStep[type] || 'Review more Igbo definitions ✅'}
        </Button>
        <Button colorScheme="gray" borderRadius="full" fontFamily="Silka" fontWeight="bold" onClick={goHome}>
          Go back home 🏡
        </Button>
      </Box>
    </Box>
  );
};

export default Completed;
