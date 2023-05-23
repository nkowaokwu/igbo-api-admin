import axios from 'axios';
import { compact } from 'lodash';
import { Record } from 'react-admin';
import { Example } from 'src/backend/controllers/utils/interfaces';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

export default async (record: Example | Record, skipAudioCheck = false) : Promise<{
  sufficientExampleRequirements: string[],
  completeExampleRequirements: string[],
}> => {
  const {
    associatedWords = [],
    style = '',
    pronunciations = [],
    igbo = '',
    english = '',
    meaning = '',
    archived = false,
  } = record;

  const isAudioAvailable = await new Promise((resolve) => {
    if (!skipAudioCheck) {
      pronunciations.forEach(({ audio }) => {
        axios.get(audio)
          .then(() => resolve(true))
          .catch(() => {
            if (audio?.startsWith?.('https://igbo-api-test-local/')) {
              return resolve(true);
            }
            return resolve(false);
          });
      });
    }
    return resolve(pronunciations[0]?.audio?.startsWith('https://'));
  });

  const sufficientExampleRequirements = compact([
    !igbo && 'Igbo is needed',
    !english && 'English is needed',
    !associatedWords.length && 'At least one associated word is needed',
    archived && 'Sentence must not be archived',
  ]);

  const completeExampleRequirements = compact([
    ...sufficientExampleRequirements,
    pronunciations.some((pronunciation) => (!pronunciation || !isAudioAvailable)) && 'An audio pronunciation is needed',
    style === ExampleStyle.PROVERB.value && !meaning && 'Meaning is required for proverb',
  ]);

  return {
    sufficientExampleRequirements,
    completeExampleRequirements,
  };
};
