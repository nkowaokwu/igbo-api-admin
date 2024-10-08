import { compact } from 'lodash';
import React from 'react';
import { LuFocus, LuScrollText } from 'react-icons/lu';
import FilterConfigType from 'src/backend/shared/constants/FilterConfigType';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import SuggestionSourceLabels from 'src/backend/shared/constants/SuggestionSourceLabels';
import { FilterConfig } from 'src/shared/components/FiltersModal/configs/filterConfigInterfaces';
import { getUsersByName } from 'src/shared/UserAPI';

const fetchUsers = async (displayName: string): Promise<{ value: string; label: string }[]> => {
  const users = await getUsersByName(displayName);
  return users
    .map(({ displayName, firebaseId }) => ({ value: firebaseId, label: displayName }))
    .filter(({ value, label }) => value && label);
};

const ExampleSuggestionFilterConfig = (isIgboAPIProject: boolean): FilterConfig[] =>
  compact([
    {
      title: 'Source',
      subtitle: 'Originate source for sentence text',
      icon: <LuScrollText />,
      sections: [
        {
          title: 'Text',
          key: 'source.text',
          type: FilterConfigType.FREE_TEXT,
          placeholder: 'Source text',
        },
        {
          title: 'Languages',
          key: 'source.languages',
          type: FilterConfigType.MULTI_SELECT,
          options: Object.values(LanguageLabels).filter(({ value }) => value !== LanguageEnum.UNSPECIFIED),
          optionsFormatter: (rawValues) =>
            rawValues.map((rawValue) => LanguageLabels[rawValue]).filter((option) => option),
        },
        {
          title: 'Speakers',
          key: 'source.pronunciations.speaker',
          type: FilterConfigType.ASYNC_MULTI_SELECT,
          fetch: fetchUsers,
          optionsFormatter: () => [],
        },
      ],
    },
    {
      title: 'Destination',
      subtitle: 'Translations for source sentence text',
      icon: <LuScrollText />,
      sections: [
        {
          title: 'Text',
          key: 'translations.text',
          type: FilterConfigType.FREE_TEXT,
          placeholder: 'Destination text',
        },
        {
          title: 'Languages',
          key: 'translations.languages',
          type: FilterConfigType.MULTI_SELECT,
          options: Object.values(LanguageLabels).filter(({ value }) => value !== LanguageEnum.UNSPECIFIED),
          optionsFormatter: (rawValues) =>
            rawValues.map((rawValue) => LanguageLabels[rawValue]).filter((option) => option),
        },
        {
          title: 'Speakers',
          key: 'translations.pronunciations.speaker',
          type: FilterConfigType.ASYNC_MULTI_SELECT,
          fetch: fetchUsers,
          optionsFormatter: () => [],
        },
      ],
    },
    isIgboAPIProject
      ? {
          title: 'Origin',
          subtitle: 'Original location where sentence is from',
          icon: <LuFocus />,
          sections: [
            {
              title: 'Origin',
              key: 'origin',
              type: FilterConfigType.MULTI_SELECT,
              options: Object.values(SuggestionSourceLabels),
              optionsFormatter: (rawValues) =>
                rawValues.map((rawValue) => SuggestionSourceLabels[rawValue]).filter((option) => option),
            },
          ],
        }
      : null,
  ]);

export default ExampleSuggestionFilterConfig;
