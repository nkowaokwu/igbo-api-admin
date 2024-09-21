import React, { ReactElement } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { compact } from 'lodash';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';
import generateGreetings from 'src/Core/Dashboard/components/utils/generateGreetings';
import {
  DataEntryFlowOption,
  DataEntryFlowGroup,
} from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import Collection from 'src/shared/constants/Collection';
import { LuBookOpenCheck, LuMic, LuUser } from 'react-icons/lu';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

const CrowdsourcingProgressManager = (): ReactElement => {
  const userProjectPermission = React.useContext(UserProjectPermissionContext);
  const showSelfIdentify =
    !userProjectPermission.languages ||
    !userProjectPermission.languages.length ||
    userProjectPermission.gender === null ||
    userProjectPermission.gender === GenderEnum.UNSPECIFIED;

  const crowdsourcingOptions: (DataEntryFlowOption & { state?: IgboSoundboxViews })[] = compact([
    showSelfIdentify
      ? {
          key: Collection.USERS,
          icon: LuUser,
          title: 'Self identify',
          subtitle: 'Enter your self-identifying information',
          hash: '#/profile',
          buttonLabel: 'Go to profile',
          group: DataEntryFlowGroup.GET_STARTED,
        }
      : null,
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: LuMic,
      title: 'Record audio for sentences',
      subtitle: 'Read and record audio for randomly provided sentences.',
      hash: '#/soundbox',
      state: IgboSoundboxViews.RECORD,
      buttonLabel: 'Record audio',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: LuBookOpenCheck,
      title: 'Verify recorded audio',
      subtitle: 'Listen to recordings from other contributors and verify the recordings are correct',
      hash: '#/soundbox',
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
  ]);

  return (
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
};

export default CrowdsourcingProgressManager;
