import React, { ReactElement, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';

const Completed = (
  {
    setIsComplete,
    setIsDirty,
    goHome,
    type,
  }
  : {
    setIsComplete: React.Dispatch<React.SetStateAction<boolean>>,
    type: CrowdsourcingType,
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
    goHome: () => void,
  },
): ReactElement => {
  const handleMore = () => {
    setIsComplete(false);
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
          {type === CrowdsourcingType.RECORD_EXAMPLE_AUDIO
            ? 'Your sentence recordings have been submitted.'
            : type === CrowdsourcingType.VERIFY_EXAMPLE_AUDIO
              ? 'Your sentence reviews have been submitted.'
              : type === CrowdsourcingType.INPUT_IGBO_DEFINITION
                ? 'Your Igbo definitions have been submitted.'
                : 'Your Igbo definition reviews have been submitted.'}
        </Text>
      </Box>
      <Box className="space-x-3 w-full flex flex-row justify-center items-center flex-wrap">
        <Button
          colorScheme="green"
          borderRadius="full"
          fontFamily="Silka"
          fontWeight="bold"
          onClick={handleMore}
        >
          {type === CrowdsourcingType.RECORD_EXAMPLE_AUDIO
            ? 'Record more sentences'
            : type === CrowdsourcingType.VERIFY_EXAMPLE_AUDIO
              ? 'Review more sentences'
              : type === CrowdsourcingType.INPUT_IGBO_DEFINITION
                ? 'Add more Igbo definitions'
                : 'Review more Igbo definitions'}
        </Button>
        <Button
          colorScheme="gray"
          borderRadius="full"
          fontFamily="Silka"
          fontWeight="bold"
          onClick={goHome}
        >
          Go back home
        </Button>
      </Box>
    </Box>
  );
};

export default Completed;
