import axios from 'axios';
import { compact } from 'lodash';
import { Record } from 'react-admin';
import { Example } from 'src/backend/controllers/utils/interfaces';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

export default async (
  record: Example | Record,
  skipAudioCheck = false,
): Promise<{
  sufficientExampleRequirements: string[];
  completeExampleRequirements: string[];
}> => {
  const {
    associatedWords = [],
    style = '',
    source = { language: LanguageEnum.UNSPECIFIED, pronunciations: [], text: '' },
    translations = [{ language: LanguageEnum.UNSPECIFIED, text: '', pronunciations: [] }],
    meaning = '',
    archived = false,
  } = record;

  const isAudioAvailable = await new Promise((resolve) => {
    if (!skipAudioCheck) {
      source.pronunciations.forEach(({ audio }) => {
        axios
          .get(audio)
          .then(() => resolve(true))
          .catch(() => {
            if (audio?.startsWith?.('https://igbo-api-test-local.com/')) {
              return resolve(true);
            }
            return resolve(false);
          });
      });
    }
    return resolve(source.pronunciations[0]?.audio?.startsWith('https://'));
  });

  const sufficientExampleRequirements = compact([
    !source?.text && 'Source text is needed',
    !translations?.[0].text && 'Translation text is needed',
    !associatedWords.length && 'At least one associated word is needed',
    archived && 'Sentence must not be archived',
  ]);

  const completeExampleRequirements = compact([
    ...sufficientExampleRequirements,
    (source.pronunciations.some((pronunciation) => !pronunciation || !isAudioAvailable) ||
      !source.pronunciations.length) &&
      'An audio pronunciation is needed',
    style === ExampleStyle[ExampleStyleEnum.PROVERB].value && !meaning && 'Meaning is required for proverb',
  ]);

  return {
    sufficientExampleRequirements,
    completeExampleRequirements,
  };
};
