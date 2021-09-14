import React, { ReactElement, useRef } from 'react';
import { Box, Heading, Spinner } from '@chakra-ui/react';

const PlatformLoader = (): ReactElement => {
  const loadingLabel = useRef(null);
  const loadingLabelOptions = [
    'Booting up the Igbo API Editor\'s Platform 🚀',
    'Underdotting our ọ\'s and ụ\'s ✍🏾',
    'Warming up our vocal cords 🎙',
  ];
  const randomInt = Math.floor(Math.random() * loadingLabelOptions.length);
  if (!loadingLabel.current) {
    loadingLabel.current = loadingLabelOptions[randomInt];
  }

  return loadingLabel ? (
    <Box className="w-screen h-screen flex flex-col justify-center items-center space-y-3">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="teal"
        size="xl"
        label={loadingLabel.current}
      />
      <Heading fontSize="lg">{loadingLabel.current}</Heading>
    </Box>
  ) : null;
};

export default PlatformLoader;
