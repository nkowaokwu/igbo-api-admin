import React, { ReactElement } from 'react';
import { Box, Heading, VStack, Text } from '@chakra-ui/react';
import Views from 'src/shared/constants/Views';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import Collection from 'src/shared/constants/Collection';
import generateGreetings from 'src/Core/Dashboard/components/utils/generateGreetings';
import {
  DataEntryFlowOption,
  DataEntryFlowGroup,
} from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import { LuFileEdit, LuHardDriveUpload } from 'react-icons/lu';
import { FiBook, FiBookOpen } from 'react-icons/fi';

export const DataEntryFlowGroupLabels = {
  [DataEntryFlowGroup.GET_STARTED]: {
    title: 'Get started',
    subtitle: 'Visit these section to get your project set up',
  },
  [DataEntryFlowGroup.CREATE_DATA]: {
    title: 'Create data',
    subtitle: 'Use these options to add ad-hoc data after your initial data dump',
  },
  [DataEntryFlowGroup.EDIT_DATA]: {
    title: 'Edit data',
    subtitle: 'Use these sections to update and make edits to your existing data',
  },
};

const getDashboardOptions = (isIgboAPIProject: boolean): DataEntryFlowOption[] => {
  const excludeFromNonIgboAPIProjects = !isIgboAPIProject
    ? [Collection.WORDS, Collection.WORD_SUGGESTIONS, Collection.NSIBIDI_CHARACTERS]
    : [];
  const defaultOptions = [
    {
      key: Collection.DATA_DUMP,
      icon: (props) => <LuHardDriveUpload {...props} />,
      title: 'Dump Data',
      subtitle: 'Get your project started by dumping your initial data',
      hash: `#/dataDump`,
      buttonLabel: 'Dump data',
      group: DataEntryFlowGroup.GET_STARTED,
    },
    {
      key: Collection.WORD_SUGGESTIONS,
      icon: (props) => <FiBook {...props} />,
      title: 'Create a New Word',
      subtitle: "Don't see a word in our database? Create a new word here. All words follow Igbo Izugbe standards.",
      hash: `#/wordSuggestions/${Views.CREATE}`,
      buttonLabel: 'Create word',
      group: DataEntryFlowGroup.CREATE_DATA,
    },
    {
      key: Collection.EXAMPLE_SUGGESTIONS,
      icon: (props) => <FiBookOpen {...props} />,
      title: 'Create a New Example Sentence',
      subtitle: 'Create a new example Igbo sentence. Each sentence includes Igbo and English.',
      hash: `#/exampleSuggestions/${Views.CREATE}`,
      buttonLabel: 'Create example sentence',
      group: DataEntryFlowGroup.CREATE_DATA,
    },
    {
      key: Collection.NSIBIDI_CHARACTERS,
      icon: '〒',
      title: 'Create a New Nsịbịdị Character',
      subtitle: 'Create a new Nsịbịdị character. Nsịbịdị characters represent a unique concept.',
      hash: `#/nsibidiCharacters/${Views.CREATE}`,
      buttonLabel: 'Create Nsịbịdị character',
      group: DataEntryFlowGroup.CREATE_DATA,
    },
    {
      key: Collection.WORDS,
      icon: (props) => <LuFileEdit {...props} />,
      title: 'Edit an Existing Word',
      subtitle: 'See a typo in a definition? Want to add a new dialect? Search for a word and edit it.',
      hash: `#/words/${Views.LIST}`,
      buttonLabel: 'Search for word',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
    {
      key: Collection.EXAMPLES,
      icon: (props) => <LuFileEdit {...props} />,
      title: 'Edit an Existing Example Sentence',
      subtitle: 'See a mistake in a translation? Want to add more metadata? Search for a sentence and edit it.',
      hash: `#/examples/${Views.LIST}`,
      buttonLabel: 'Search for example sentence',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
    {
      key: Collection.NSIBIDI_CHARACTERS,
      icon: (props) => <LuFileEdit {...props} />,
      title: 'Edit an Existing Nsịbịdị Character',
      subtitle: 'Want to add more information to an existing character? Search for an Nsịbịdị character and edit it.',
      hash: `#/nsibidiCharacters/${Views.LIST}`,
      buttonLabel: 'Search for Nsịbịdị character',
      group: DataEntryFlowGroup.EDIT_DATA,
    },
  ];

  return defaultOptions.filter(({ key }) => !excludeFromNonIgboAPIProjects.includes(key));
};

const ProgressManager = (): ReactElement => {
  const isIgboAPIProject = useIsIgboAPIProject();
  const options = getDashboardOptions(isIgboAPIProject);
  return (
    <VStack py={6} px={{ base: 6, md: 12 }} gap={4} alignItems="start">
      <VStack alignItems="left">
        <Heading as="h1">{generateGreetings()}</Heading>
        <Text fontWeight="medium" color="gray.500" fontFamily="Silka">
          Here&apos;s an overview of your available tasks
        </Text>
      </VStack>
      <Box className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" width="full">
        {options.map((option) => (
          <DataEntryFlow key={option.title} {...option} />
        ))}
      </Box>
    </VStack>
  );
};

export default ProgressManager;
