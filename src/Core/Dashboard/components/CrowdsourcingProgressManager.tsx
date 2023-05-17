import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';

type CrowdsourcingOption = {
  icon: string,
  title: string,
  hash: string,
  state?: IgboSoundboxViews,
};

const crowdsourcingOptions: CrowdsourcingOption[] = [
  {
    icon: '🎙',
    title: 'Record Igbo audio',
    hash: '#/igboSoundbox',
    state: IgboSoundboxViews.RECORD,
  },
  {
    icon: '✅',
    title: 'Verify recorded Igbo audio',
    hash: '#/igboSoundbox',
    state: IgboSoundboxViews.VERIFY,
  },
  {
    icon: '✍🏾',
    title: 'Add Igbo definitions',
    hash: '#/igboDefinitions',
  },
];

const handleNavigation = ({
  hash,
  state,
} : {
  hash: string,
  state?: IgboSoundboxViews,
}) => {
  window.location.search = `igboSoundboxView=${state}`;
  window.location.replace(hash);
  // window.location.hash = hash;
};

const CrowdsourcingProgressManager = (): ReactElement => (
  <Box className="flex flex-col justify-start items-center">
    <Box className="py-6 flex flex-col justify-center items-center space-y-2">
      <Heading fontFamily="Silka" textAlign="center" fontSize="xl">
        Kedụ ọdi enyemaka ị ga-achọ inyere anyị?
      </Heading>
      <Text fontSize="xs" fontFamily="Silka" fontStyle="italic">
        What would you like to help with?
      </Text>
    </Box>
    <Box className="w-full lg:w-10/12 grid grid-flow-row grid-cols-2 gap-1">
      {crowdsourcingOptions.map(({
        icon,
        title,
        hash,
        state,
      }) => (
        <Box
          borderColor="gray.300"
          borderWidth="1px"
          borderRadius="md"
          className="flex flex-col justify-center"
          minHeight="175px"
          textAlign="center"
          onClick={() => handleNavigation({ hash, state })}
        >
          <Text fontSize="6xl">{icon}</Text>
          <Text
            color="gray.800"
            fontSize="md"
            fontWeight="bold"
            fontFamily="Silka"
          >
            {title}
          </Text>
        </Box>
      ))}
    </Box>
  </Box>
);

export default CrowdsourcingProgressManager;
