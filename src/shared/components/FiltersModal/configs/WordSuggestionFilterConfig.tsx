import React from 'react';
import { LuBackpack, LuScrollText } from 'react-icons/lu';
import FilterConfigType from 'src/backend/shared/constants/FilterConfigType';
import WordClass from 'src/backend/shared/constants/WordClass';
import { FilterConfig } from 'src/shared/components/FiltersModal/configs/filterConfigInterfaces';
import { getUsersByName } from 'src/shared/UserAPI';

const fetchUsers = async (displayName: string): Promise<{ value: string; label: string }[]> => {
  const users = await getUsersByName(displayName);
  return users
    .map(({ displayName, firebaseId }) => ({ value: firebaseId, label: displayName }))
    .filter(({ value, label }) => value && label);
};

const WordSuggestionFilterConfig: FilterConfig[] = [
  {
    title: 'Word',
    subtitle: 'Headword with metadata information',
    icon: <LuScrollText />,
    sections: [
      {
        title: 'Word',
        key: 'word',
        type: FilterConfigType.FREE_TEXT,
        placeholder: 'Headword',
      },
      {
        title: 'Nsịbịdị',
        key: 'definitions.nsibidi',
        type: FilterConfigType.MULTI_SELECT,
        options: [
          { label: 'Exists', value: 'true' },
          { label: "Doesn't exist", value: 'false' },
        ],
        optionsFormatter: (rawValues) =>
          rawValues.map((rawValue) =>
            rawValue === 'true' ? { label: 'Exists', value: 'true' } : { label: "Doesn't exist", value: 'false' },
          ),
      },
      {
        title: 'Pronunciation',
        key: 'pronunciation',
        type: FilterConfigType.MULTI_SELECT,
        options: [
          { label: 'Exists', value: 'true' },
          { label: "Doesn't exist", value: 'false' },
        ],
        optionsFormatter: (rawValues) =>
          rawValues.map((rawValue) =>
            rawValue === 'true' ? { label: 'Exists', value: 'true' } : { label: "Doesn't exist", value: 'false' },
          ),
      },
      {
        title: 'Part of Speech',
        key: 'definitions.wordClass',
        type: FilterConfigType.MULTI_SELECT,
        options: Object.values(WordClass),
        optionsFormatter: (rawValues) => rawValues.map((rawValue) => WordClass[rawValue]).filter((option) => option),
      },
      {
        title: 'Creator',
        key: 'authorId',
        type: FilterConfigType.ASYNC_MULTI_SELECT,
        fetch: fetchUsers,
        optionsFormatter: () => [],
      },
    ],
  },
  {
    title: 'Definitions',
    subtitle: 'Definitions for the word',
    icon: <LuScrollText />,
    sections: [
      {
        title: 'English Definitions',
        key: 'definitions.definitions',
        type: FilterConfigType.FREE_TEXT,
        placeholder: 'English definition text',
      },
      {
        title: 'Igbo Definitions',
        key: 'definitions.igboDefinitions.igbo',
        type: FilterConfigType.FREE_TEXT,
        placeholder: 'Igbo definition text',
      },
    ],
  },
  {
    title: 'State',
    subtitle: 'State of the word',
    icon: <LuBackpack />,
    sections: [
      {
        title: 'Finalized',
        key: 'merged',
        type: FilterConfigType.MULTI_SELECT,
        options: [
          { label: 'Is finalized', value: 'true' },
          { label: "Isn't finalized", value: 'false' },
        ],
        optionsFormatter: (rawValues) =>
          rawValues.map((rawValue) =>
            rawValue === 'true'
              ? { label: 'Is finalized', value: 'true' }
              : { label: "Isn't finalized", value: 'false' },
          ),
      },
      {
        title: 'Igbo Definitions',
        key: 'definitions.igboDefinitions.igbo',
        type: FilterConfigType.FREE_TEXT,
        placeholder: 'Igbo definition text',
      },
    ],
  },
];

export default WordSuggestionFilterConfig;
