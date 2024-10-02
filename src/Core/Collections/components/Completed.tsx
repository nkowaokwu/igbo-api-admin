import React, { ReactElement, useEffect } from 'react';
import { get, noop } from 'lodash';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import ProjectType from 'src/backend/shared/constants/ProjectType';
import { LuHome, LuRefreshCcw } from 'react-icons/lu';

interface NextStep {
  [key: string]: {
    contribute: {
      title: string;
      subtitle: string;
    };
    verify: {
      title: string;
      subtitle: string;
    };
  };
}

const ProjectTypeNextStep: NextStep = {
  [ProjectType.TEXT_AUDIO_ANNOTATION]: {
    contribute: {
      title: 'Record more sentences',
      subtitle: 'Your sentence recordings have been submitted',
    },
    verify: {
      title: 'Verify more sentences',
      subtitle: 'Your sentence reviews have been submitted.',
    },
  },
  [ProjectType.TRANSLATION]: {
    contribute: {
      title: 'Translate more sentences',
      subtitle: 'Your sentence translations have been submitted.',
    },
    verify: {
      title: 'Verify more sentences',
      subtitle: 'Your sentence reviews have been submitted.',
    },
  },
};

const Completed = ({
  setIsComplete,
  setIsDirty = noop,
  type,
  isVerifying,
}: {
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDirty?: React.Dispatch<React.SetStateAction<boolean>>;
  type: ProjectType;
  isVerifying: boolean;
}): ReactElement => {
  const projectTypeKey = isVerifying ? 'verify' : 'contribute';

  const handleMore = () => {
    setIsComplete(false);
  };

  const goHome = () => {
    window.location.href = '#/';
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
        <Text textAlign="center">{get(ProjectTypeNextStep[type], `${projectTypeKey}.subtitle`)}</Text>
      </Box>
      <Box
        className="space-x-3 w-full flex flex-col lg:flex-row 
      justify-center items-center flex-wrap space-y-4 lg:space-y-0"
      >
        <Button
          variant="primary"
          fontFamily="Silka"
          fontWeight="bold"
          onClick={handleMore}
          rightIcon={<LuRefreshCcw />}
        >
          {get(ProjectTypeNextStep[type], `${projectTypeKey}.title`)}
        </Button>
        <Button colorScheme="gray" fontFamily="Silka" fontWeight="bold" onClick={goHome} rightIcon={<LuHome />}>
          Go back home
        </Button>
      </Box>
    </Box>
  );
};

export default Completed;
