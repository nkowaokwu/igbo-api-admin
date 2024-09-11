import { Record } from 'react-admin';
import { get } from 'lodash';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

/**
 * Extracts the source and first destination language from the record
 */
export default (record: Record, project: ProjectData): { sourceLanguage: string; destinationLanguage: string } => {
  const sourceLanguage = get(record, 'source.language');
  const destinationLanguage = get(record, 'translations.0.language');

  const sourceLanguageLabel =
    sourceLanguage === LanguageEnum.UNSPECIFIED
      ? LanguageLabels[project.languages[0]]?.label
      : LanguageLabels[sourceLanguage]?.label;

  const destinationLanguageLabel =
    destinationLanguage === LanguageEnum.UNSPECIFIED
      ? 'Destination language'
      : LanguageLabels[destinationLanguage]?.label;

  return {
    sourceLanguage: sourceLanguageLabel || 'Source language',
    destinationLanguage: destinationLanguageLabel || 'Destination language',
  };
};
