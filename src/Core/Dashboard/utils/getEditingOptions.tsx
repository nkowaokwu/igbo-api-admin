import React from 'react';
import Collection from 'src/shared/constants/Collection';
import { LuHardDriveUpload, LuFileEdit } from 'react-icons/lu';
import { FiBook, FiBookOpen } from 'react-icons/fi';
import {
  DataEntryFlowOption,
  DataEntryFlowGroup,
} from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import Views from 'src/shared/constants/Views';

export const getEditingOptions = ({ isIgboAPIProject }: { isIgboAPIProject: boolean }): DataEntryFlowOption[] => {
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
      title: 'Create a New Sentence Draft',
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
      title: 'Edit an Existing Sentence',
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
