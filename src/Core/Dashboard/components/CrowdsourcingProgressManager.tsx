import React, { ReactElement } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';
import generateGreetings from 'src/Core/Dashboard/components/utils/generateGreetings';
import {
  DataEntryFlowOption,
  DataEntryFlowGroup,
} from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import Collection from 'src/shared/constants/Collection';
import { LuBookOpenCheck, LuMic } from 'react-icons/lu';

const crowdsourcingOptions: (DataEntryFlowOption & { state?: IgboSoundboxViews })[] = [
  {
    key: Collection.EXAMPLE_SUGGESTIONS,
    icon: LuMic,
    title: 'Record Igbo audio for example Igbo sentences',
    subtitle: 'Read Igbo sentences and record them out loud to build the largest Igbo audio library',
    hash: '#/igboSoundbox',
    state: IgboSoundboxViews.RECORD,
    buttonLabel: 'Record audio',
    group: DataEntryFlowGroup.EDIT_DATA,
  },
  {
    key: Collection.EXAMPLE_SUGGESTIONS,
    icon: LuBookOpenCheck,
    title: 'Verify recorded Igbo audio',
    subtitle: 'Listen to Igbo recordings from other contributors and verify the recordings are correct',
    hash: '#/igboSoundbox',
    state: IgboSoundboxViews.VERIFY,
    buttonLabel: 'Verify audio',
    group: DataEntryFlowGroup.EDIT_DATA,
  },
  // {
  //   icon: '✍🏾',
  //   title: 'Add Igbo definitions',
  //   subtitle: 'Add Igbo definitions to existing word entries in the largest Igbo dictionary',
  //   hash: '#/igboDefinitions',
  // },
  // {
  //   icon: '🇳🇬',
  //   title: 'Add Igbo sentences',
  //   subtitle: 'Add Igbo sentences to contribute to the largest Igbo dictionary',
  //   hash: '#/igboDefinitions',
  // },
  // {
  //   icon: <TranslateIcon boxSize={8} />,
  //   title: 'Translate Igbo sentences',
  //   subtitle: 'Translate Igbo sentences to English to improve Igbo translation technology',
  //   hash: '#/translate',
  // },
  // {
  //   icon: '📸',
  //   title: 'Upload images of Igbo text',
  //   subtitle: 'Upload images that contain Igbo text to be later annotated',
  //   hash: '#/igboTextImages',
  // },
];

const CrowdsourcingProgressManager = (): ReactElement => (
  <VStack py={6} px={12} gap={4} alignItems="start">
    <VStack alignItems="left">
      <Heading as="h1">{generateGreetings()}</Heading>
      <Text fontWeight="medium" color="gray.500" fontFamily="Silka">
        Here&apos;s an overview of your available tasks
      </Text>
    </VStack>
    <Box className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" width="full">
      {crowdsourcingOptions.map((option) => (
        <DataEntryFlow key={option.title} {...option} />
      ))}
    </Box>
  </VStack>
);

export default CrowdsourcingProgressManager;
