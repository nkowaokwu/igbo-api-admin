import { Record } from 'react-admin';
import { get } from 'lodash';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';

/**
 * Extracts the source and first destination language from the record
 */
export default (record: Record): { sourceLanguage: string; destinationLanguage: string } => {
  const sourceLanguage = LanguageLabels[get(record, 'source.language')]?.label || 'Source language';
  const destinationLanguage = LanguageLabels[get(record, 'translations.0.language')]?.label || 'Destination language';

  return { sourceLanguage, destinationLanguage };
};
