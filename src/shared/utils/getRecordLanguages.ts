import { Record } from 'react-admin';
import { get } from 'lodash';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';

/**
 * Extracts the source and destination language from the record
 */
export default (record: Record): { sourceLanguage: string } => {
  const sourceLanguageLabel = LanguageLabels[get(record, 'source.language')]?.label;

  return {
    sourceLanguage: sourceLanguageLabel || 'Source language',
  };
};
